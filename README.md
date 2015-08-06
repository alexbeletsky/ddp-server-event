# DDP Server based on Events

The implementation of [DDP](https://www.meteor.com/ddp) server based on [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter).

## Usage

```bash
$ npm install --save ddp-server-events
```

```js
var server = new Ddp({server: server});

ddp.on('ready', function () {
    console.log('ddp server ready');
});

ddp.on('error', function (err) {
    console.error('ddp server failed', err);
});

ddp.on('sub', function (id, name, params) {
    // handle subscription to collection here...

    this.sendReady();   // in case of error, this.sendNosub();
});

ddp.on('unsub', function (id, name, params) {
    // handle unbsubcription here...

    this.sendReady();
});

ddp.on('method:test', function (id, params) {
    var x = params.x, y = params.y;
    var sum = x + y;

    this.sendResult(sum);
});
```

## Methods

ddp.sendResult();

ddp.sendError();

ddp.sendAdded();

ddp.sendChanged();

ddp.sendDeleted();

ddp.sendEvent();
