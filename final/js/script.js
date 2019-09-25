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
