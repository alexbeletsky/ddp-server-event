var util = require('util');
var events = require('events');

var WebSocket = require('faye-websocket');
var EJSON = require('ejson');

function Request (req, sock, body) {
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

        sendNosub: function (id) {
            send({msg: 'nosub', subs: [id]});
        },

        sendEvent: function (msg, data) {
            data.msg = msg;
            send(data);
        }
    };

    var request = {
        id: session,

        handle: function (ddp) {
            ws.on('open', handleOpen.bind(ddp));
            ws.on('message', handleMessage.bind(ddp));
            ws.on('close', handleClose.bind(ddp));
        },

        close: function () {
            if (ws) {
                ws.close();
                ws = session = null;
            }
        }
    };

    function handleOpen() {
        this.emit('connected', request);
    }

    function handleMessage(event) {
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
    }

    function handleClose () {
        this.emit('disconnected', request);
        ws = session = null;
    }

    return request;
}

function Ddp(options) {
    if (!options || !options.server) {
        throw new Error('missing server instance');
    }

    var ddp = this;
    var server = options.server;
    var requests = [];

    events.EventEmitter.call(this);

    ddp.on('connected', function (request) {
        requests.push(request);
    });

    ddp.on('disconnected', function (request) {
        requests.splice(requests.indexOf(request), 1);
    });

    server.on('upgrade', function (req, sock, body) {
        if (WebSocket.isWebSocket(req)) {
            var request = new Request(req, sock, body);
            request.handle(ddp);
        }
    });

    ddp.listen = function () {
        server.listen.apply(server, arguments);
    };

    ddp.close = function () {
        // closing all active requests..
        requests.forEach(function (r) {
            r.close();
        });

        requests = [];

        server.close.apply(server, arguments);
    };
}

util.inherits(Ddp, events.EventEmitter);

module.exports = Ddp;
