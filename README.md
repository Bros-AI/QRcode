# QR Code Tool - Generator & Scanner

A simple, fast, and modern web-based tool to generate and scan QR codes directly in your browser. Built with vanilla HTML, CSS, and JavaScript, leveraging powerful libraries for QR code functionality.

## ✨ Features

*   **Generate QR Codes:**
    *   Create QR codes from URLs or any text.
    *   Instant preview of the generated QR code on a canvas element.
    *   Download generated QR codes as high-quality PNG images.
    *   Input validation and clear error messages.
*   **Scan QR Codes:**
    *   Scan QR codes using your device's camera (front or rear).
    *   Live camera feed for easy aiming.
    *   Option to switch between available cameras if multiple are detected.
    *   Displays scanned content, with clickable links for URLs.
    *   Success feedback (visual and optional sound/vibration).
*   **User-Friendly Interface:**
    *   Clean, modern, and responsive design suitable for desktop and mobile devices.
    *   Intuitive tabbed navigation to switch between generator and scanner.
    *   Loading indicators for asynchronous operations.
*   **Client-Side & Secure:**
    *   All processing (generation and scanning) happens directly in your browser.
    *   No data is sent to any server, ensuring privacy.
    *   Includes Content Security Policy (CSP) and other security headers for enhanced protection.

## 🚀 Technologies Used

*   **HTML5:** For the structure of the web page.
*   **CSS3:** For styling, responsiveness, and animations (including CSS Custom Properties for easy theming).
*   **Vanilla JavaScript (ES6+):** For all the application logic and interactivity.
*   **[qrcode.js](https://github.com/davidshimjs/qrcodejs):** A popular JavaScript library for generating QR codes. (CDN: `qrcode.min.js`)
*   **[html5-qrcode](https://github.com/mebjas/html5-qrcode):** A robust JavaScript library for implementing QR code scanning using the device camera. (CDN: `html5-qrcode`)


## 📋 Usage

### To Generate a QR Code:
1.  Open the application and ensure the "Generate QR Code" tab is active.
2.  Enter the URL or text you wish to encode in the input field.
3.  Click the "Generate QR Code" button.
4.  The QR code will be displayed below.
5.  Click the "Download QR Code" button to save it as a PNG image.

### To Scan a QR Code:
1.  Switch to the "Scan QR Code" tab.
2.  If prompted, grant the browser permission to access your camera.
3.  Point your device's camera at a QR code.
4.  Once a QR code is detected, its content will be displayed below the camera view.
5.  If you have multiple cameras, you can use the "🔄" (switch camera) button to toggle between them.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please make sure to update tests as appropriate.



---

Made with ❤️ by [Bros AI](https://bros.ai)
([GitHub](https://github.com/Bros-AI) | [X/Twitter](https://x.com/GauthierBros) | [LinkedIn](https://www.linkedin.com/in/gauthier-bros/))
