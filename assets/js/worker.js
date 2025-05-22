// worker.js

self.onmessage = async function(event) {
    const userQueryParameters = event.data; // Parameters for the LLM API call from the main thread

    try {
        // --- 1. Fetch the authentication token ---
        console.log('Worker: Fetching token from https://localhost/token.txt');
        const tokenResponse = await fetch('https://localhost/token.txt');
        if (!tokenResponse.ok) {
             throw new Error(`HTTP error fetching token! status: ${tokenResponse.status}`);
        }
        const token = (await tokenResponse.text()).trim();
        console.log('Worker: Token fetched successfully.');

        // --- 2. Prepare and make the LLM API call ---
        const defaultApiPayload = {
            model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
            messages: [ // Default messages, can be overridden by userQueryParameters.messages
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "What model are you?" }
            ],
            max_tokens: 2000,
            prompt_truncate_len: 1500,
            temperature: 1,
            top_p: 1,
            top_k: 50,
            frequency_penalty: 0,
            presence_penalty: 0,
            repetition_penalty: 1,
            n: 1,
            ignore_eos: false,
            stop: "stop", // Assuming "stop" is a literal string or your API handles it
            response_format: null,
            stream: false,
            context_length_exceeded_behavior: "truncate"
        };

        // Merge user-provided parameters with defaults. User parameters take precedence.
        const finalApiPayload = { ...defaultApiPayload, ...userQueryParameters };

        const apiOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalApiPayload)
        };

        console.log('Worker: Making API call to Fireworks AI with payload:', finalApiPayload);
        const apiCallResponse = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', apiOptions);

        if (!apiCallResponse.ok) {
            let errorDetails = await apiCallResponse.text();
            try {
                // Try to parse if the error response is JSON for more structured info
                errorDetails = JSON.parse(errorDetails);
            } catch (e) {
                // It's not JSON, use the raw text
            }
            console.error('Worker: API Error Response:', errorDetails);
            throw new Error(`API Error: ${apiCallResponse.status} - ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
        }

        const apiData = await apiCallResponse.json();
        console.log('Worker: API call successful, response:', apiData);

        // Send the successful result back to the main thread
        self.postMessage({ type: 'success', data: apiData });

    } catch (error) {
        console.error('Worker: An error occurred:', error.message);
        // Send the error back to the main thread
        self.postMessage({ type: 'error', error: error.message });
    }
};

console.log('Worker: Script loaded and ready for messages.');
