<!-- This would be part of your web page's HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Page for Extension</title>
</head>
<body>
    <h1>Web Page Content</h1>
    <p>This page can communicate with the Chrome extension.</p>
    <button id="sendMessageToExtensionBtn">Send Message to Extension</button>

    <script>
        // This is the page's JavaScript
        const PAGE_MESSAGE_SOURCE = 'my-page-script'; // Must match content.js
        const EXTENSION_MESSAGE_SOURCE = 'my-extension-content-script'; // Must match content.js

        console.log('[Page Script] Page script loaded.');

        // Function to send a message to the content script
        function sendMessageToContentScript(type, payload) {
            console.log(`[Page Script] Sending message to content script:`, { type, payload });
            window.postMessage({
                source: PAGE_MESSAGE_SOURCE,
                type: type,
                payload: payload
            }, window.location.origin); // Target the current window's origin
        }

        // Listen for messages from the content script
        window.addEventListener('message', (event) => {
            // We only accept messages from the window itself (same origin)
            if (event.source !== window || event.origin !== window.location.origin) {
                return;
            }

            const message = event.data;

            if (message && message.source === EXTENSION_MESSAGE_SOURCE) {
                console.log('[Page Script] Received message from content script:', message);

                if (message.type === 'CONTENT_SCRIPT_LOADED') {
                    alert(`Page Script received: ${message.payload.message}`);
                    // Respond to the content script
                    sendMessageToContentScript('PAGE_SCRIPT_READY', { greeting: 'Hello from the Page Script!' });
                } else if (message.type === 'ACKNOWLEDGEMENT_FROM_EXTENSION') {
                    alert(`Page Script received acknowledgement: ${message.payload.text}`);
                }
                // Handle other message types from the content script
            }
        });

        // Example: Send a message when a button is clicked
        document.getElementById('sendMessageToExtensionBtn').addEventListener('click', () => {
            const dataToSend = {
                timestamp: new Date().toISOString(),
                info: 'This is custom data sent from the page.'
            };
            sendMessageToContentScript('CUSTOM_DATA_FROM_PAGE', dataToSend);
        });

        // You could also send an initial message if needed, e.g., on page load
        // sendMessageToContentScript('PAGE_LOADED_AND_READY', { status: 'Page is fully interactive' });

    </script>
</body>
</html>
