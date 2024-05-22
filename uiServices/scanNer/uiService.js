service.isOpen = false;
service.BarcodeDetectorInstance = {};
service.closeAfterCodeScanned = null;

service.openScanner = async function (message) {
    service.closeAfterCodeScanned = message.config.closeAfterCodeScanned;
    service.BarcodeDetectorInstance = service.initScanner(message.config.formats);
    let camElement = service.createModal();
    let codeScanned = await openCamera(camElement);
    codeScanned = codeScanned[0].rawValue;
    service.sendEvent("codeSuccessfullyScanned", {code: codeScanned});
};

service.initScanner = function (formats) {
    if (!("BarcodeDetector" in window)) {
        window.BarcodeDetector = barcodeDetectorPolyfill.BarcodeDetectorPolyfill
    }
    return new BarcodeDetector({
        formats: formats && formats.length ? formats : ['code_128', 'qr_code'],
    });

};

service.createModal = function () {
    //creates the modal and returns the camera HTMLVideoElement
    if (service.isOpen) return console.log('The scanner is already open.');
    service.isOpen = true;
    const content = document.createElement('div');
    content.id = 'scanner-window';
    const modalWrapper = document.createElement('div');
    modalWrapper.style.cssText = ` 
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 902;
        display: flex;
        align-items: center;
        justify-content: center;`;
    modalWrapper.className = 'modal fade in';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        background-color: white;
        padding: 20px;
        overflow: hidden;
        `;
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        padding-right: 0px;
        padding-top: 0px;`;
    const closeButton = document.createElement('div');
    closeButton.id = 'close-button';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        background-color: #575555;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000`;
    closeButton.textContent = 'X';
    let camElement = document.createElement('video');
    camElement.id = 'camera';
    camElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;`;
    modalBody.appendChild(closeButton);
    modalBody.appendChild(camElement);
    modalContent.appendChild(modalBody);
    modalWrapper.appendChild(modalContent);
    content.appendChild(modalWrapper);
    document.getElementById('applicationHost').append(content);
    document.addEventListener('keydown', function (event) {
        // 'Esc' key is pressed
        if (event.key === 'Escape' || event.keyCode === 27) { // use keyCode deprecated API for legacy
            service.closeScan();
        }
    });
    document.getElementById('close-button').addEventListener('click', function (event) {
        service.closeScan();
    });
    return camElement;
};

service.closeScan = function () {
    const videoTrack = document.getElementById('camera').srcObject.getVideoTracks()[0];
    videoTrack.stop();
    document.getElementById('camera').srcObject = null;
    document.getElementById('scanner-window').remove();
    service.isOpen = false;
};

async function openCamera(videoElement) {
    return new Promise((resolve, reject) => {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var videoConstraints = {
            video: {}
        };
        isMobile ? videoConstraints.video.facingMode = {exact: "environment"} : videoConstraints.video = true;
        navigator.mediaDevices.getUserMedia(videoConstraints)
            .then(stream => {
                videoElement.setAttribute("autoplay", "true");
                videoElement.setAttribute("playsinline", "true");
                videoElement.setAttribute("muted", "true");
                videoElement.setAttribute("loop", "true");
                videoElement.srcObject = stream;
                videoElement.addEventListener('loadedmetadata', async () => {
                    videoElement.play();
                    //each frame of the streaming video is processed in this function
                    processVideoFrame(resolve);
                });
            }).catch(error => {
            console.log('There was an error to access the camera:', error);
            reject(error);
        });
    });
}

async function processVideoFrame(resolve) {
    const videoElement = document.getElementById('camera');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let barcodes = await service.BarcodeDetectorInstance.detect(imageData);
    if (barcodes.length) {
        if (service.closeAfterCodeScanned) service.closeScan();
        resolve(barcodes);
    } else {
        requestAnimationFrame(() => processVideoFrame(resolve));
    }
}
