var http = require('http');
var expect = require('expect.js');

var Ddp = require('../source');
var DdpClient = require('ddp.js');

var webSocket = require('faye-websocket');

var createServer = function () {
    return http.createServer();
};

var createDdp = function (httpServer) {
    return new Ddp({server: httpServer});
};

var createClient = function () {
    var options = {
        endpoint: 'ws://localhost:3000/websocket',
        SocketConstructor: webSocket.Client
    };

    return new DdpClient(options);
};

describe('ddp server', function () {
    var httpServer, ddpServer, ddpClient;

    describe('constuction', function () {
        beforeEach(function () {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);
        });

        afterEach(function (done) {
            ddpServer.close(done);
        });

        it('server should be started', function (done) {
            ddpServer.listen(3000, function (err) {
                done(err);
            });
        });
    });

    describe('client connected', function () {
        beforeEach(function () {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);

            ddpServer.listen(3000);
        });

        beforeEach(function () {
            ddpClient = createClient();
        });

        afterEach(function (done) {
            ddpServer.close(done);
        });

        it('client should connect', function (done) {
            ddpClient.on('connected', done);
        });
    });

    describe('server closes connection', function () {
        beforeEach(function () {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);

            ddpServer.listen(3000);
        });

        beforeEach(function () {
            ddpClient = createClient();
        });

        beforeEach(function (done) {
            ddpServer.close(done);
        });

        it('client should disconnect', function (done) {
            ddpClient.on('disconnected', function () {
                done();
            });
        });
    });

    describe('client closes connection', function () {
        beforeEach(function () {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);

            ddpServer.listen(3000);
        });

        beforeEach(function () {
            ddpClient = createClient();
        });

        afterEach(function (done) {
            ddpServer.close(done);
        });

        it('server should handle disconnect', function (done) {
            ddpClient.on('connected', function () {
                ddpClient.close();

                ddpServer.on('disconnected', function (request) {
                    done();
                });
            });
        });
    });

    describe('ready event', function () {
        beforeEach(function () {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);
        });

        afterEach(function (done) {
            ddpServer.close(done);
        });

        it('should ready event emitted after start', function (done) {
            ddpServer.on('ready', function () {
                done();
            });

            ddpServer.listen(3000);
        });
    });

    describe('client calls method', function () {
        beforeEach(function (done) {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);
            ddpServer.listen(3000, done);
        });

        beforeEach(function (done) {
            ddpClient = createClient();
            ddpClient.on('connected', done);
        });

        afterEach(function () {
            ddpClient.close();
        });

        afterEach(function () {
            ddpServer.close();
        });

        it('should server should recieve call', function (done) {
            ddpServer.on('method:test', function (id, params) {
                expect(id).to.be.ok();
                expect(params.x).to.equal(1);
                expect(params.y).to.equal(2);

                done();
            });

            ddpClient.method('test', {x: 1, y: 2});
        });

        it('should server reply the call', function (done) {
            var fromId;

            ddpServer.on('method:test', function (id, params) {
                var x = params.x, y = params.y;
                var sum = x + y;

                fromId = id;

                this.sendResult(id, sum);
            });

            ddpClient.on('result', function (message) {
                expect(message).to.be.ok();
                expect(message.msg).to.equal('result');
                expect(message.id).to.equal(fromId);
                expect(message.result).to.equal(3);

                done();
            });

            ddpClient.method('test', {x: 1, y: 2});
        });
    });

    describe('client calls sub', function () {
        beforeEach(function (done) {
            httpServer = createServer();
            ddpServer = createDdp(httpServer);
            ddpServer.listen(3000, done);
        });

        beforeEach(function (done) {
            ddpClient = createClient();
            ddpClient.on('connected', done);
        });

        afterEach(function () {
            ddpClient.close();
        });

        afterEach(function () {
            ddpServer.close();
        });

        it('ready responded', function (done) {
            ddpServer.on('sub', function (id, name, params) {
                expect(name).to.equal('names');
                expect(params.param).to.equal(1);

                this.sendReady(id);
            });

            ddpClient.on('ready', function(a) {
                done();
            });

            ddpClient.sub('names', {param: 1});
        });

        it('nosub responded', function (done) {
            var error = 'collection not found';

            ddpServer.on('sub', function (id, name, params) {
                expect(name).to.equal('names');
                expect(params.param).to.equal(1);

                this.sendNosub(id, error);
            });

            ddpClient.on('nosub', function(id, e) {
                done();
            });

            ddpClient.sub('names', {param: 1});
        });
    });

});
