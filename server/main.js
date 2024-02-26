'use strict';

import http from 'http';

const port = 8080;

const relay = { url: 'https://example.com/' };

function
handleGet(req, res)
{
	res.writeHead(200);
	res.end(JSON.stringify(relay));
}

async function
handlePost(req, res)
{
	let json = '';
	if (!/^application\/json/.test(req.headers['content-type'])) {
		res.writeHead(415);
		res.end(JSON.stringify({
			error: 'Unsupported Media Type',
		}));
		return ;
	}
	req.on('data', data => json += data);
	req.on('end', () => {
		try {
			const url = new URL(JSON.parse(json).url);
			relay.url = url;
			res.writeHead(200);
			res.end(JSON.stringify(relay));
		} catch (err) {
			res.writeHead(415);
			res.end(JSON.stringify({
				error: 'Invalid URL',
			}));
		}
	});
}

function
handleOptions(req, res)
{
	res.writeHead(200, {
		'Access-Control-Allow-Headers': '*',
		'Access-Control-Allow-Methods': 'POST',
	});
	res.end(JSON.stringify(relay));

}

function
handleOther(req, res)
{
	res.writeHead(405, {
		'Allow': 'GET, HEAD, OPTIONS, POST',
	});
	res.end(JSON.stringify({
		error: 'Method Not Allowed',
	}));
}

function
handleServer(req, res)
{
	const handler = {
		'GET': handleGet,
		'POST': handlePost,
		'OPTIONS': handleOptions,
	};
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	(handler[req.method] || handleOther)(req, res);
}

http.createServer(handleServer).listen(port);
