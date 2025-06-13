const webcam = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        webcam.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing webcam:', error);
    });

captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    // Send dataUrl to server for processing
});
