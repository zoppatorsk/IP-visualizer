import { modal } from './stores/';
export default async function fetchData(postData) {
	//fetch data from server.. why do i even use fetch?? soo much extra junk needed...
	try {
		const result = await fetch(import.meta.env.VITE_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(postData),
		});

		if (!result.ok) {
			const err = new Error(`Error! status: ${result.status}`); //throw it n handle in catch block
			// @ts-ignore -- shut upp ts, i dont want to build custom errors just for this junk
			err.code = result.status; //add status code to error
			throw err; //let catch handle it
		}

		return await result.json();
	} catch (error) {
		let message = '';
		if (error?.code) {
			switch (error.code) {
				case 413: //just use a fallthrough if JSON Parser fails.
				case 400:
					message = 'Bad request! What are u mocking around with?';
					break;
				case 429:
					message = 'Rate limited! Stop spamming bro!';
					break;
				case 500:
					message = 'Internal server error. Congratz u broke something, plz report bugs!';
					break;
				default:
					message = '??Unknown error??';
					break;
			}
		}
		if (error == 'TypeError: NetworkError when attempting to fetch resource.') message = 'No connection to server, either server is down or CORS is needed ';
		if (!message) message = 'Unknown error'; //if no error message is set default to this
		modal.set({ open: true, title: 'Error', message });
		return [];
	}
}
