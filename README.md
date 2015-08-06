# DDP Server based on Events

The implementation of [DDP]() server based on [EventEmitter]().

## Usage

Installation,

```bash
$ npm install --save ddp-server-events
```

```js
var server = new Ddp({server: server});

ddp.on('ready', function () {
    
});

ddp.on('error', function () {

});

ddp.on('sub', function () {

});

ddp.on('unsub', function () {

});

ddp.on('method:test', function () {

});
```

## Methods

ddp.sendResult();

ddp.sendError();

ddp.sendAdded();

ddp.sendChanged();

ddp.sendDeleted();

ddp.sendEvent();
