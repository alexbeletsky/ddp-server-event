# DDP Server based on Events

The implementation of [DDP](https://www.meteor.com/ddp) server based on [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter).

## Usage

```bash
$ npm install --save ddp-server-events
```

```js
var server = http.createServer();
var ddp = new Ddp({server: server});

ddp.on('ready', function () {
    console.log('ddp server ready');
});

ddp.on('error', function (err) {
    console.error('ddp server failed', err);
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

    this.sendResult(sum);
});

server.listen(3000);
```

## Methods

Each event handler binded to `ddp` instance as `this`, such methods are available.

##### `ddp.sendResult();`

Sends the result back to subscriber.

##### `ddp.sendError();`

Sends the error back to subscriber.

##### `ddp.sendAdded();`

Sends `added` back to subscriber.

##### `ddp.sendChanged();`

Sends `changed` back to subscriber.

##### `ddp.sendDeleted();`

Sends `deleted` back to subscriber.

##### `ddp.sendEvent();`

Sends *generic* back to subscriber.

##### `ddp.sendReady();`

Sends *ready* event, should be called inside `sub` event handler.

##### `ddp.sendNosub();`

Sends *nosub* event, should be called inside `sub` event handler.

### References

* [DDP-Server](https://github.com/Tarang/DDP-Server)

## License

MIT alexander.beletsky@gmail.com
