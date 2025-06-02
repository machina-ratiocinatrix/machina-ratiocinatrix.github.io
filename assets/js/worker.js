// worker.js

self.onmessage = async function(event) {
    // Parameters for the LLM API call from the main thread
    const incomingUserQueryParameters = event.data;

    try {
        // --- 1. Fetch the authentication token ---
        console.log('Worker: Fetching token from https://localhost/');
        const tokenResponse = await fetch('https://localhost/fireworks.txt');
        if (!tokenResponse.ok) {
             throw new Error(`HTTP error fetching token! status: ${tokenResponse.status}`);
        }
        const token = (await tokenResponse.text()).trim();
        console.log('Worker: Token fetched successfully.');

        // --- 2. Fetch instruction ---
        let instructionText; // Declare here to ensure it's in scope
        try {
            console.log('Worker: Fetching instruction from https://localhost');
            const instructionResponse = await fetch('https://localhost/machina.txt');
            if (!instructionResponse.ok) {
                 console.log(`Worker: HTTP error fetching instruction! status: ${instructionResponse.status}. Using default instruction.`);
                 // Default instruction if fetching fails or file not found
                 instructionText = "You are a helpful assistant.";
            } else {
                instructionText = (await instructionResponse.text()).trim();
                console.log('Worker: Instruction fetched successfully.');
                console.log('Worker: Instruction:', instructionText);
            }
        } catch (fetchError) {
            console.error('Worker: Error during instruction file fetch:', fetchError.message, '. Using default instruction.');
            instructionText = "You are a helpful assistant."; // Default instruction on any fetch error
        }

        // --- 3. Prepare messages for the API call ---
        const systemInstructionMessage = { role: "system", content: instructionText };
        let messagesForApi;

        // Check if the main thread sent any messages
        if (incomingUserQueryParameters.messages && Array.isArray(incomingUserQueryParameters.messages) && incomingUserQueryParameters.messages.length > 0) {
            // User provided messages: unshift/prepend the fetched system instruction
            messagesForApi = [systemInstructionMessage, ...incomingUserQueryParameters.messages];
            console.log('Messages for API:', messagesForApi)
        } else {
            // No messages from user, or an empty array: use the system instruction and a default user prompt
            messagesForApi = [
                systemInstructionMessage,
                { role: "user", content: "What model are you?" } // Default user prompt
            ];
        }

        // --- 4. Prepare the final API payload ---
        const defaultApiParameters = {
            model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
            // Note: 'messages' is omitted here
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
            stop: "stop",
            response_format: null,
            stream: false,
            context_length_exceeded_behavior: "truncate"
        };

        // Merge default parameters, then incoming user parameters (which might override temp, max_tokens, etc.),
        // and finally, explicitly set the constructed 'messagesForApi'.
        const finalApiPayload = {
            ...defaultApiParameters,
            ...incomingUserQueryParameters, // User-specific parameters like temperature, max_tokens will override defaults
            messages: messagesForApi      // Ensure our carefully constructed messages array is used
        };
        console.log('Worker: Final API payload:', finalApiPayload);


        // --- 5. Make the LLM API call ---
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
        console.error('Worker: An error occurred:', error.message, error); // Log the full error object for more details
        // Send the error back to the main thread
        self.postMessage({ type: 'error', error: error.message });
    }
};

console.log('Worker: Script loaded and ready for messages.');
