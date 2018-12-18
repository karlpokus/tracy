const tracy = require('../../lib/tracy');
const http = require('http');
const url = require('url');
const requestLib = require('request');
const server = http.createServer();

// curl localhost:9123/?users=n
const handler = (clientRequest, serverResponse) => {
	const { query } = url.parse(clientRequest.url, true);
	const jsonEndPOint = `http://jsonplaceholder.typicode.com/users/${ query.users }`;
	let data = "";

	/*requestLib.get(jsonEndPOint, (err, apiCallResponse, body) => {
		if (err) {
			return serverResponse.end(`Oops! ${ err.message }`)
		}
		return serverResponse.end(JSON.parse(body).name);
	});*/

	requestLib
		.get(jsonEndPOint)
		.on('response', apiCallResponse => {
			serverResponse.end(apiCallResponse.statusCode + "");
		})
		.on('error', err => {
			serverResponse.end(`Oops! ${ err.message }`)
		})
}

server.on('request', handler)
server.listen(9123, () => { console.log('running') });
