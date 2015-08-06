var util = require('util');
var events = require('events');

var WebSocket = require('faye-websocket');
var EJSON = require('ejson');

function Context (req, sock, body) {
    var ws = new WebSocket(req, sock, body);
    var session = new Date().getTime().toString();

    var send = function (data) {
        ws.send(EJSON.stringify(data));
    };

    var methods = {
        sendResult: function (id, result) {
            send({msg: 'result', id: id, result: result});
            send({msg: 'updated', id: id});
        },

        sendError: function (id, error) {
            send({msg: 'error', id: id, error: error});
        },

        sendAdded: function (id, collection, fields) {
            send({msg: 'added', id: id, collection: collection, fields: fields});
        },

        sendChanged: function (id, collection, fields, cleared) {
            send({msg: 'changed', id: id, collection: collection, fields: fields, cleared: cleared});
        },

        sendDeleted: function (id, collection, fields, cleared) {
            send({msg: 'removed', id: id, collection: collection, fields: fields, cleared: cleared});
        },

        sendReady: function (id) {
            send({msg: 'ready', subs: [id]});
        },

        sendEvent: function (msg, data) {
            data.msg = msg;
            send(data);
        }
    };

    var handleMessage = function (event) {
        var data = JSON.parse(event.data);
        var message = data.msg;

        // hanle special cases as `connected` and `pong`
        if (message === 'connect') {
            methods.sendEvent('connected', {session: session});
        } else if (message === 'ping') {
            methods.sendEvent('pong', {id: data.id});
        // handle rpc calls
        } else if (message === 'method'){
            var prefixed = 'method:' + message;
            this.emit.call(methods, prefixed, data.id, data.params);
        // generic handler
        } else {
            this.emit.call(methods, message, data.params);
        }
    };

    var handleClose = function () {
        ws = session = null;
        this.emit.call(methods, 'disconnected');
    };

    return {
        handle: function (ddp) {
            ws.on('message', handleMessage.bind(ddp));
            ws.on('close', handleClose.bind(ddp));
        }
    };
}

function Ddp(options) {
    if (!options || !options.server) {
        throw new Error('missing server instance');
    }

    var server = options.server;

    events.EventEmitter.call(this);

    var handleRequest = function (req, sock, body) {
        var context = new Context(req, sock, body);
        context.handle(this);
    };

    server.on('upgrade', function (req, sock, body) {
        if (WebSocket.isWebSocket(req)) {
            handleRequest(req, sock, body);
        }
    });
}

util.inherits(Ddp, events.EventEmitter);

module.exports = Ddp;
