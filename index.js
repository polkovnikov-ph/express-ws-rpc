module.exports = function (ws) {
	var currReqId = 0;
	var callbacks = {};
	
	// on incoming message
	ws.on('message', dispatch); // for eventemitter from ws
	ws.on('data', dispatch); // for eventemitter from simple-websocket
	function dispatch(msg) {
		var obj = JSON.parse(msg.toString());
		if (obj.result) {
			dispatchResult(obj);
		} else {
			dispatchRequest(obj);
		}
	}
	
	// the other side has sent response
	function dispatchResult(obj) {
		//console.log('got response: ', obj);
		callbacks[obj.reqId](obj.err, obj.result);
		delete callbacks[obj.reqId];
	}
	
	// the other side has sent request
	function dispatchRequest(obj) {
		//console.log('incoming request: ', obj);
		var args = [obj.method].concat(obj.args, [responder]);
		ws.emit.apply(ws, args);
		function responder(err, result) {
			var resp = JSON.stringify({
				reqId: obj.reqId,
				err: err,
				result: result
			});
			//console.log('responding', resp);
			ws.send(new Buffer(resp));
		}
	}
	
	// call the method on the other side
	ws.call = function (method /*, args, callback */) {
		var reqId = currReqId++;
		var args = Array.prototype.slice.call(arguments);
		args.shift(); // drop `method`
		callbacks[reqId] = args.pop();
		var req = {
			method: method,
			reqId: reqId,
			args: args
		};
		//console.log('requesting: ', req);
		ws.send(new Buffer(JSON.stringify(req)));
	};
};