# express-ws-rpc

Simple JSON RPC over ws or simple-websocket

## Installation

    npm install --save express-ws-rpc

## Server

	var express = require('express');
	var wsrpc = require('express-ws-rpc');

	// create app
	var app = express();

	// add websocket support to express app
	var wss = require('express-ws')(app).wss;

	// on websocket request to the root
	app.ws('/', function(ws, req) {
		// this function gets called on each connection
		
		// extend ws to decode messages
		wsrpc(ws);
		
		// define method that can be called from the client
		ws.on('addServer', function (a, b, result) {
			result(null, a + b);
		});
		
		// define method depending on the state
		// each connected client owns its own `curr`
		var curr = 0;
		ws.on('next', function (result) {
			result(null, curr++);
		});
		
		// call method that is defined on the client
		ws.call('addClient', 1, 2, function(err, sum) {
			console.log('Client: 1 + 2 = ', sum, err);
		});
	});

## Client (browserify)

	// convert relative WebSocket URL to the absolute one
	function getWsAbsoluteUrl(relative) {
		var loc = window.location;
		var proto = loc.protocol === "https:" ? "wss://" : "ws://";
		var port = loc.port || (loc.protocol === "https:" ? 443 : 80);
		return proto + loc.hostname + ":" + port + relative;
	}

	// create WebSocket client
	// I'm not using `ws` here, because it doesn't support
	// EventEmitter interface (i.e. the one that lets you call `on`)
	var WebSocket = require('simple-websocket');
	var ws = new WebSocket(getWsAbsoluteUrl('/'));
	
	// extend ws to decode messages
	require('express-ws-rpc')(ws);

	// method definition
	ws.on('addClient', function (a, b, result) {
		result(null, a + b);
	});

	// when we get connected
	ws.on('connect', function () {
		// call method that is defined on the server
		ws.call('addServer', 10, 20, function (err, sum) {
			console.log('Server: 10 + 20 = ', sum, err);
		});
	});
	
## License

MIT
	
## Contribution
	
Everybody loves issues. You should probably create one.