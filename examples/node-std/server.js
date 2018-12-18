const tracy = require('../../lib/tracy');
const http = require('http');
const url = require('url');
const server = http.createServer();

// curl localhost:9123/?users=n
const handler = (req, res) => {
	const { query } = url.parse(req.url, true);
	const jsonEndPOint = `http://jsonplaceholder.typicode.com/users/${ query.users }`;
	let data = "";

	http.request(jsonEndPOint, apiCallResponse => {
		apiCallResponse
			.on('data', chunk => {
				data += chunk;
			})
			.on('end', () => {
				res.end(JSON.parse(data).name || 'unknown');
			});
	})
	.on('error', err => {
		res.end(`Oops! ${ err.message }`)
	})
	.end();
}

server.on('request', handler)
server.listen(9123, () => { console.log('running') });
