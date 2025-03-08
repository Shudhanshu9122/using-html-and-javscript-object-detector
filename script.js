const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Use Roboflow's YOLOv8 API (Change API Key Below)
const API_KEY = "your_roboflow_api_key";  // Replace with your key
const MODEL_NAME = "yolov8";
const MODEL_VERSION = "1";  

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }  // Uses laptop webcam
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => { resolve(video); };
    });
}

async function detectObjects() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Convert video frame to an image
    const img = document.createElement("canvas");
    img.width = video.videoWidth;
    img.height = video.videoHeight;
    img.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Send image to Roboflow API for detection
    const data = new FormData();
    data.append("file", img.toDataURL());

    const response = await fetch(`https://detect.roboflow.com/${MODEL_NAME}/${MODEL_VERSION}?api_key=${API_KEY}`, {
        method: "POST",
        body: data
    });

    const predictions = await response.json();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw detected objects
    predictions.predictions.forEach(prediction => {
        const { x, y, width, height, class: label, confidence } = prediction;
        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.stroke();
        ctx.fillText(`${label} (${Math.round(confidence * 100)}%)`, x, y - 5);
    });

    requestAnimationFrame(detectObjects);
}

async function start() {
    await setupCamera();
    detectObjects();
}

start();
