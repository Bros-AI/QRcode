// Global variables
let html5QrcodeScanner = null;
let currentCamera = 'environment'; // Default to back camera
let cameras = [];

// DOM Elements (cache for performance)
const urlInputElement = document.getElementById('url-input');
const errorMessageElement = document.getElementById('error-message');
const generateBtnElement = document.getElementById('generate-btn');
const spinnerElement = document.getElementById('spinner');
const qrCanvasElement = document.getElementById('qr-canvas');
const qrContainerElement = document.getElementById('qr-container');
const switchCameraButtonElement = document.getElementById('switch-camera');
const resultElement = document.getElementById('result');
const readerElement = document.getElementById('reader');
const generatorContainerElement = document.getElementById('generator-container');
const scannerContainerElement = document.getElementById('scanner-container');
const tabButtons = document.querySelectorAll('.tab-button');


// Generator functions
function validateURL(url) {
    if (!url) return false;
    // Basic check for non-empty string for text QR codes
    if (url.trim().length === 0) return false;
    // Attempt to validate as URL, but allow plain text too
    try {
        new URL(url); // This will throw an error if 'url' is not a valid absolute URL
        return true;
    } catch (_) {
        // If it's not a valid URL, we still accept it as text if it's not just whitespace
        return url.trim().length > 0;
    }
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    urlInputElement.classList.add('error');
}

function clearError() {
    errorMessageElement.style.display = 'none';
    urlInputElement.classList.remove('error');
}

function setLoading(isLoading) {
    generateBtnElement.disabled = isLoading;
    spinnerElement.style.display = isLoading ? 'inline-block' : 'none'; // Use inline-block for spinner
    generateBtnElement.querySelector('span').style.opacity = isLoading ? '0.7' : '1';
}

async function generateQRCode() {
    const url = urlInputElement.value.trim();
    clearError();

    if (!validateURL(url)) { // Now also allows plain text
        showError('Please enter a valid URL or text');
        return;
    }

    setLoading(true);

    try {
        // Clear previous QR code by resetting canvas dimensions
        qrCanvasElement.width = qrCanvasElement.width; // Clears the canvas

        await QRCode.toCanvas(qrCanvasElement, url, {
            width: 256,
            margin: 2, // Reduced margin slightly
            errorCorrectionLevel: 'H', // High error correction
            color: {
                dark: '#111827', // --gray-900
                light: '#ffffff'  // White
            }
        });

        qrContainerElement.style.display = 'block';
    } catch (error) {
        console.error('Error generating QR code:', error);
        showError('Could not generate QR code. Please try again.');
    } finally {
        setLoading(false);
    }
}

function downloadQRCode() {
    if (!qrCanvasElement || qrCanvasElement.height === 0) {
        showError("Please generate a QR code first.");
        return;
    }
    const link = document.createElement('a');
    link.download = 'qrcode.png';

    // Ensure canvas has content
    if (qrCanvasElement.toDataURL() === "data:,") {
        showError("Cannot download an empty QR code.");
        return;
    }

    try {
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.click();
                URL.revokeObjectURL(url); // Clean up
            } else {
                showError("Failed to create image blob for download.");
            }
        }, 'image/png');
    } catch (e) {
        console.error("Error creating blob:", e);
        showError("An error occurred during download preparation.");
    }
}

// Scanner functions
async function initializeScanner() {
    if (!scannerContainerElement || scannerContainerElement.style.display === 'none') {
        return; // Don't initialize if scanner tab is not active
    }

    try {
        const devices = await Html5Qrcode.getCameras();
        cameras = devices;

        if (devices && devices.length > 0) {
            switchCameraButtonElement.style.display = devices.length > 1 ? 'block' : 'none';
            startScanner();
        } else {
            showScannerError("No camera found on this device.");
            switchCameraButtonElement.style.display = 'none';
        }
    } catch (err) {
        console.error('Camera initialization error:', err);
        showScannerError("Camera access error. Please ensure camera permissions are granted and refresh.");
        switchCameraButtonElement.style.display = 'none';
    }
}

function startScanner() {
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        // html5QrcodeScanner.stop().catch(err => console.warn("Error stopping previous scan:", err));
        console.log("Scanner already running or trying to stop previous.");
    }

    // Ensure reader element is visible and has dimensions
    if (readerElement.offsetWidth === 0 || readerElement.offsetHeight === 0) {
        console.warn("Reader element is not visible or has no dimensions. Scanner might not start correctly.");
        // Defer scanner start slightly if needed
        // setTimeout(startScanner, 100);
        // return;
    }

    html5QrcodeScanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7); // Use 70% of the smaller dimension
            return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0, // Square scanning box
        rememberLastUsedCamera: true, // Useful for users
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    // Determine camera ID to use
    let cameraId = cameras.find(camera => camera.label.toLowerCase().includes(currentCamera))?.id;
    if (!cameraId && cameras.length > 0) {
        cameraId = cameras[0].id; // Fallback to the first camera
        currentCamera = cameras[0].label.toLowerCase().includes('user') ? 'user' : 'environment'; // Update currentCamera
    }


    if (!cameraId) {
        showScannerError("Could not determine a camera to use.");
        return;
    }

    html5QrcodeScanner.start(
        cameraId, // Use specific camera ID
        config,
        onScanSuccess,
        onScanError
    ).catch((err) => {
        console.error('Scanner start error:', err);
        let message = "Failed to start scanner.";
        if (err.name === "NotAllowedError") {
            message = "Camera access was denied. Please allow camera access in your browser settings.";
        } else if (err.name === "NotFoundError") {
            message = "No camera found or the selected camera is unavailable.";
        }
        showScannerError(message);
    });
}

function switchCamera() {
    if (cameras.length < 2) return; // No other camera to switch to

    // Stop current scanner before switching
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop()
            .then(() => {
                currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
                startScanner();
            })
            .catch(err => {
                console.error("Error stopping scanner for camera switch:", err);
                // Still try to switch
                currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
                startScanner();
            });
    } else {
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        startScanner();
    }
}

function onScanSuccess(decodedText, decodedResult) {
    resultElement.style.display = 'block';
    resultElement.classList.remove('result-error');
    resultElement.classList.add('result-success-container'); // For distinct styling if needed

    let formattedText = escapeHtml(decodedText);
    if (isValidHttpUrl(decodedText)) {
        formattedText = `<a href="${decodedText}" target="_blank" rel="noopener noreferrer" class="result-link">${escapeHtml(decodedText)}</a>`;
    }

    resultElement.innerHTML = `
        <div class="result-success">QR Code Scanned!</div>
        <div><strong>Content:</strong> ${formattedText}</div>
    `;

    // Optional: Provide feedback like vibration or sound
    if (navigator.vibrate) {
        navigator.vibrate(100); // Vibrate for 100ms
    }
    // Consider stopping the scan after a successful read, or provide a button to rescan
    // html5QrcodeScanner.stop().catch(err => console.warn("Error stopping scan after success:", err));
}

function onScanError(errorMessage) {
    // This function is called frequently when no QR code is found.
    // We generally don't want to display these errors to the user unless it's persistent.
    // console.debug(`QR Scan Error: ${errorMessage}`);
    // You could implement a counter to show an error if it fails for too long
}

function showScannerError(message) {
    resultElement.style.display = 'block';
    resultElement.classList.remove('result-success-container');
    resultElement.classList.add('result-error'); // Use class for styling error
    resultElement.innerHTML = `<div class="result-error-message">${escapeHtml(message)}</div>`;
}

// Utility functions
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, "")
         .replace(/'/g, "'");
}

// Tab switching logic
function switchTab(tabName) {
    const isGenerator = tabName === 'generator';
    generatorContainerElement.style.display = isGenerator ? 'block' : 'none';
    scannerContainerElement.style.display = isGenerator ? 'none' : 'block';

    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('onclick').includes(`'${tabName}'`)) {
            button.classList.add('active');
        }
    });

    // Manage scanner lifecycle
    if (isGenerator) {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop()
                .catch(err => console.warn("Error stopping scanner when switching to generator:", err));
        }
        resultElement.style.display = 'none'; // Hide previous scan results
    } else {
        // Scanner tab is active
        resultElement.style.display = 'none'; // Clear previous results before starting new scan
        initializeScanner();
    }
}

// Event Listeners
urlInputElement.addEventListener('input', clearError);
urlInputElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});

// The generateQRCode function is called via onclick attribute in HTML
// The downloadQRCode function is called via onclick attribute in HTML

switchCameraButtonElement.addEventListener('click', switchCamera);

// Initialize with generator tab active by default (as per HTML)
// switchTab('generator'); // No need to call if HTML sets the 'active' class correctly

// Initial setup if scanner tab is pre-selected (though generator is default)
if (scannerContainerElement.style.display !== 'none') {
    initializeScanner();
}