const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia(
        { video: {} }
    ).then(stream => {
        video.srcObject = stream;
    }).catch(err => console.error("Error accessing webcam: ", err));
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // Handle the dominant emotion
        handleEmotion(resizedDetections);
    }, 100);
});

// Function to handle emotions
function handleEmotion(detections) {
    if (detections.length === 0) return; // No face detected

    detections.forEach(detection => {
        const expressions = detection.expressions;
        const maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

        // Trigger actions based on the dominant emotion
        switch (maxExpression) {
            case "happy":
                document.body.style.backgroundColor = "lightgreen";
                displayMessage("You're happy! 😊");
                break;
            case "sad":
                document.body.style.backgroundColor = "lightblue";
                displayMessage("Feeling blue? 😢");
                break;
            case "neutral":
                document.body.style.backgroundColor = "lightgray";
                displayMessage("Looking neutral. 😐 Make an emotion!");
                break;
            case "angry":
                document.body.style.backgroundColor = "red";
                displayMessage("Looking angry! 😤");
                break;
            case "disgusted":
                document.body.style.backgroundColor = "green";
                displayMessage("You look disgusted. 🤮");
                break;
            case "surprised":
                document.body.style.backgroundColor = "purple";
                displayMessage("Looking surprised. 😐");
                break;
        }
    });
}

// Helper function to display a message based on emotion
function displayMessage(message) {
    let messageDiv = document.getElementById('emotion-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'emotion-message';
        messageDiv.style.position = 'fixed';
        messageDiv.style.bottom = '20px';
        messageDiv.style.width = '100%';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.fontSize = '24px';
        messageDiv.style.color = '#333';
        document.body.appendChild(messageDiv);
    }
    messageDiv.textContent = message;
}