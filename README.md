# How to Build .wav!

## Setting Up

We're going to start by creating an index.html file in a new directory. The project will consist of index.html, style.css, and scripts.js at the end. This HTML and CSS file are complete and will not change. We'll be using JavaScript to add everything from here out.

### index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <title>.wav!</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
    <link rel="stylesheet" href="styles/style.css">
</head>

<body>

    <h1>Take a snapshot with webcam to be analyzed</h1>
    <label>Take a snapshot of a animal</label>
    <div>
        <button onclick="startWebcam();">Start WebCam</button>
        <button id="takeSnap" disabled>Take Snapshot</button>
        <button onclick="stopWebcam();">Stop WebCam</button>
    </div>
    <video width=325 height=225 id="video" controls autoplay></video>

    <div>
        <p>Image:</p>
        <canvas id="sourceImage"></canvas>
        <img id="spinner" src="loading.gif" alt="loading" class="hidden">
        <pre id="responseArea"></pre>
        <audio id="sourceAudio" controls src=""></audio>
    </div>

    <script type="text/javascript" src="js/script.js"></script>

</body>

</html>
```

### style.css

```css
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 300;
    padding: 0.5em;
    max-width: 40em;
    margin: 0 auto;
}

label {
    display: block;
}

input,
button {
    padding: .5em;
    margin: .2em;
    border-radius: .3em;
}

input {
    display: block;
    font-size: 1em;
}

button {
    font-size: .8em;
    background: hsl(200, 30%, 50%);
    color: white;
    border: none;
}

button:disabled {
    background: hsl(200, 30%, 70%);
    color: hsl(200, 30%, 90%);
}

img {
    max-width: 100%;
    display: block;
}

canvas {
    max-width: 100%;
}

.hidden {
    display: none;
}
```

Now that we have the HTML and CSS set up, you can make scripts.js and we'll continue from there.

## script.js

> Note that the **code won't work if you don't put your own subscription key**

```javascript
var subscriptionKey = "PUT YOUR SUBSCRIPTION KEY HERE";
```

And we're done! Here is the final scripts.js code.

```javascript
        // **********************************************
        // *** Update or verify the following values. ***
        // **********************************************

        var subscriptionKey = "PUT YOUR SUBSCRIPTION KEY HERE";
        var endpoint = "https://westeurope.api.cognitive.microsoft.com/";
        var uriBase = endpoint + "vision/v2.0/analyze";
        var webcamStream;

        // Request parameters.
        var params = {
            "visualFeatures": "Objects",
            "details": "",
            "language": "en",
        };

        // ***********************************************************************
        // *** function startWebcam                                           ***
        // *** ask permision from user and start webcam, then                 ***
        // *** enable the button to take a snapshot                           ***
        // ***********************************************************************
        function startWebcam() {
            var vid = document.querySelector('video');
            // request cam
            navigator.mediaDevices.getUserMedia({
                    video: true
                })
                .then(stream => {
                    // save stream to variable at top level so it can be stopped lateron
                    webcamStream = stream;
                    // show stream from the webcam on te video element
                    vid.srcObject = stream;
                    // returns a Promise to indicate if the video is playing
                    return vid.play();
                })
                .then(() => {
                    // enable the 'take a snap' button
                    var btn = document.querySelector('#takeSnap');
                    btn.disabled = false;
                    // when clicked
                    btn.onclick = e => {
                        takeSnap()
                            .then(blob => {
                                analyseImage(blob, params, showResults);
                            })
                    };
                })
                .catch(e => console.log('error: ' + e));
        }

        // ***********************************************************************
        // *** function takeSnap                                              ***
        // *** show snapshotimage from webcam                                 ***
        // *** convert image to blob                                          ***
        // ***********************************************************************

        function takeSnap() {
            // get video element
            var vid = document.querySelector('video');
            // get canvas element
            var canvas = document.querySelector('canvas');
            // get its context
            var ctx = canvas.getContext('2d');
            // set its size to the one of the video
            canvas.width = vid.videoWidth;
            canvas.height = vid.videoHeight;
            // show snapshot on canvas
            ctx.drawImage(vid, 0, 0);
            // show spinner image below
            document.querySelector('#spinner').classList.remove('hidden');
            return new Promise((res, rej) => {
                // request a Blob from the canvas
                canvas.toBlob(res, 'image/jpeg');
            });
        }

        // ***********************************************************************
        // *** function stopWebcam                                             ***
        // *** stop webcam                                                     ***
        // *** disable snapshot button                                         ***
        // ***********************************************************************

        function stopWebcam() {
            var vid = document.querySelector('video');
            vid.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
            // disable snapshot button
            document.querySelector('#takeSnap').disabled = true;
        }


        // ***********************************************************************
        // *** function analyseImage                                           ***
        // *** analyse image using cognitive services of Microsoft             ***
        // *** img - image to analyse                                          ***
        // *** params - object containing params to send                       ***
        // *** processingFunction - name of function to call to process the response ***
        // ***********************************************************************

        function analyseImage(image, params, proccessingFunction) {

            // create API url by adding params
            var paramString = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
            var urlWithParams = uriBase + "?" + paramString;

            // do API call
            fetch(urlWithParams, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Ocp-Apim-Subscription-Key": subscriptionKey
                    },
                    processData: false,
                    body: image,
                })
                // then turn response into json
                .then(response => response.json())
                // then go to processingFunction
                .then(json => proccessingFunction(json))
                // show alert window if something goes wrong
                .catch(error => alert(error.message));
        }

        // ***********************************************************************
        // *** function showResults                                            ***
        // *** show results found by AI service                                ***
        // *** json - json response from AI                                    ***
        // ***********************************************************************

        function showResults(json) {

            // hide spinner image onto the canvas
            document.querySelector('#spinner').classList.add('hidden');


            ///////
            var stringLB = JSON.stringify(json.objects[0].object);
            var stringLBtrimmed = stringLB.substr(1, stringLB.length - 2);
            ///////


            // hide spinner image onto the canvas
            document.querySelector('#spinner').classList.add('hidden');
            // show results in responseArea
            document.querySelector('#responseArea').textContent = stringLBtrimmed;


            var sourceAudio = document.getElementById("sourceAudio");
            sourceAudio.src = './audio/' + stringLBtrimmed + '1.wav'


        }
```
