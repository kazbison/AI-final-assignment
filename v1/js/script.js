        function processImage() {
            // **********************************************
            // *** Update or verify the following values. ***
            // **********************************************

            let subscriptionKey = process.env['COMPUTER_VISION_SUBSCRIPTION_KEY'];
            let endpoint = process.env['COMPUTER_VISION_ENDPOINT']
            if (!subscriptionKey) {
                throw new Error('Set your environment variables for your subscription key and endpoint.');
            }

            var uriBase = endpoint + "vision/v2.0/analyze";

            // Request parameters.
            var params = {
                "visualFeatures": "Objects",
                "details": "",
                "language": "en",
            };

            // Display the image.
            var sourceImageUrl = document.getElementById("inputImage").value;
            document.querySelector("#sourceImage").src = sourceImageUrl;

            // Make the REST API call.
            $.ajax({
                    url: uriBase + "?" + $.param(params),

                    // Request headers.
                    beforeSend: function (xhrObj) {
                        xhrObj.setRequestHeader("Content-Type", "application/json");
                        xhrObj.setRequestHeader(
                            "Ocp-Apim-Subscription-Key", subscriptionKey);
                    },

                    type: "POST",

                    // Request body.
                    data: '{"url": ' + '"' + sourceImageUrl + '"}',
                })

                .done(function (data) {
                    // Show formatted JSON on webpage.
                    // $("#responseTextArea").val(JSON.stringify(data, null, 2));
                    // console.log(JSON.stringify(data.objects[0].object));
                    var animalName = document.getElementById("animalName");

                    ///////
                    var stringLB = JSON.stringify(data.objects[0].object);
                    var stringLBtrimmed = stringLB.substr(1, stringLB.length - 2);
                    animalName.innerHTML = stringLBtrimmed;
                    ///////

                    var sourceAudio = document.getElementById("sourceAudio");
                    sourceAudio.src = './audio/' + stringLBtrimmed + '1.wav'

                })

                .fail(function (jqXHR, textStatus, errorThrown) {
                    // Display error message.
                    var errorString = (errorThrown === "") ? "Error. " :
                        errorThrown + " (" + jqXHR.status + "): ";
                    errorString += (jqXHR.responseText === "") ? "" :
                        jQuery.parseJSON(jqXHR.responseText).message;
                    alert(errorString);
                });
        };
