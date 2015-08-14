[![Build Status](https://travis-ci.org/alexbeletsky/ddp-server-event.svg?branch=master)](https://travis-ci.org/alexbeletsky/ddp-server-event)
[![Coverage Status](https://coveralls.io/repos/alexbeletsky/ddp-server-event/badge.svg?branch=master&service=github)](https://coveralls.io/github/alexbeletsky/ddp-server-event?branch=master)
[![Code Climate](https://codeclimate.com/github/alexbeletsky/ddp-server-event/badges/gpa.svg)](https://codeclimate.com/github/alexbeletsky/ddp-server-event)
[![Dependency Status](https://david-dm.org/alexbeletsky/ddp-server-event.svg)](https://david-dm.org/alexbeletsky/ddp-server-event)
[![devDependency Status](https://david-dm.org/alexbeletsky/ddp-server-event/dev-status.svg)](https://david-dm.org/alexbeletsky/ddp-server-event#info=devDependencies)

# DDP Server based on Events

The implementation of [DDP](https://www.meteor.com/ddp) server based on [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter).

## Usage

```bash
$ npm install --save ddp-server-event
```

```js
var server = http.createServer();
var ddp = new Ddp({server: server});

ddp.on('ready', function () {
    console.log('ddp server ready');
});

ddp.on('sub', function (id, name, params) {
    // handle sub to collection here...
    this.sendReady();   // in case of error, this.sendNosub();
});

ddp.on('unsub', function (id, name, params) {
    // handle unsub here...
    this.sendReady();
});

// all methods calls are prefixed with "method:"
ddp.on('method:test', function (id, params) {
    var x = params.x, y = params.y;
    var sum = x + y;

    this.sendResult(id, sum);
});

server.listen(3000);
```

## Methods

Each event handler binded to `ddp` instance as `this`, such methods are available.

##### `ddp.sendResult(id, result);`

Sends the result back to subscriber.

##### `ddp.sendError(id, error);`

Sends the error back to subscriber.

##### `ddp.sendAdded(id, collection, fields);`

Sends *added* back to subscriber.

##### `ddp.sendChanged(id, collection, fields, cleared);`

Sends *changed* back to subscriber.

##### `ddp.sendRemoved(id, collection, fields, cleared);`

Sends *removed* back to subscriber.

##### `ddp.sendReady(id);`

Sends *ready* event, should be called inside `sub` event handler.

##### `ddp.sendNosub(id);`

Sends *nosub* event, should be called inside `sub` event handler.

##### `ddp.sendEvent(msg, data);`

Sends *generic* back to subscriber.

### References

* [DDP-Server](https://github.com/Tarang/DDP-Server)

## License

MIT alexander.beletsky@gmail.com
