const tracy = require('../../lib/tracy');
const http = require('http');
const url = require('url');
const ax = require('axios');
const server = http.createServer();

// curl localhost:9123/?users=n
const handler = (clientRequest, serverResponse) => {
	const { query } = url.parse(clientRequest.url, true);
	const jsonEndPOint = `http://jsonplaceholder.typicode.com/users/${ query.users }`;
	let data = "";

	ax.get(jsonEndPOint)
		.then(apiCallResponse => {
			serverResponse.end(apiCallResponse.data.name || 'unknown');
		})
		.catch(err => {
			serverResponse.end(`Oops! ${ err.message }`)
		});
}

server.on('request', handler)
server.listen(9123, () => { console.log('running') });
