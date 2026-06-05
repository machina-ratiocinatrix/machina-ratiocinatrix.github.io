// localhostapi.js
let machineConfig = null;
let text = null;
let llmSettings = null;
let responseData = null;


self.onmessage = async function (event) {
	// Parameters for the localhost call from the main thread
	machineConfig = event.data.config;
	console.log('Worker received machine config:', machineConfig);
	llmSettings = event.data.settings;
	text = event.data.text;
	console.log('Worker received text:', text);


	try {
		// --- 5. Make localhost POST
		
		const request = 'Machina-Ratiocinatrix'
		const appendix = encodeURIComponent(request);
		const base_url = 'https://localhost:443';
		const url = `${base_url}/${appendix}`;
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
				},
				body: text,
			});
			
			if (response.ok) {
				responseData = await response.text();
				console.log('postText Success:', responseData);
				self.postMessage({type: 'success', data: responseData});
			} else {
				console.log('postText Error:', response.status, response.statusText);
				responseData = '';
			}
		} catch (error) {
			console.log('postText Network error:', error);
			const base_url = 'https://localhost:8443';
			const test_url = `${base_url}/${appendix}`;
			console.log('postText: did not succeed with the main url. Trying the test_url.');
			try {
				const response = await fetch(test_url, {
					method: 'POST',
					headers: {
						'Content-Type': 'text/plain',
					},
					body: text,
				});
				
				if (response.ok) {
					responseData = await response.text();
					console.log('postText Success:', responseData);
					self.postMessage({type: 'success', data: responseData});
					
				} else {
					console.log('postText Error:', response.status, response.statusText);
					responseData = ''
				}
			} catch (error) {
				console.log('postText Network error:', error);
				self.postMessage({type: 'error', error: error.message});
			}
		}
		//
		//
		// if (!apiCallResponse.ok) {
		// 	let errorDetails = await apiCallResponse.text();
		// 	try {
		// 		// Try to parse if the error response is JSON for more structured info
		// 		errorDetails = JSON.parse(errorDetails);
		// 	} catch (e) {
		// 		// It's not JSON, use the raw text
		// 	}
		// 	console.error('Worker: API Error Response:', errorDetails);
		// 	throw new Error(`API Error: ${apiCallResponse.status} - ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
		// }
		//
		// const apiData = await apiCallResponse.json();
		// console.log('Worker: API call successful, response:', apiData);
		// const choice = apiData.output
		// console.log('Worker: API output:', choice);

		// Send the successful result back to the main thread
		self.postMessage({type: 'success', data: responseData});

	} catch (error) {
		console.error('Worker: An error occurred:', error.message, error); // Log the full error object for more details
		// Send the error back to the main thread
		self.postMessage({type: 'error', error: error.message});
	}
};

console.log('Worker: Script loaded and ready for messages.');
