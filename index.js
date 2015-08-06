var util = require('util');
var events = require('events');

var WebSocket = require('faye-websocket');
var EJSON = require('ejson');

function Context (req, sock, body) {
    var ws = new WebSocket(req, sock, body);
    var session = new Date().getTime().toString();

    var methods = {

    };

    var handleMessage = function (event) {
        var data = JSON.parse(event.data);
    };

    var handleClose = function () {
        this.emit.call(methods, 'disconnected', session);
        ws = session = null;
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
