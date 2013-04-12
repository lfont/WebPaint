/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var express       = require('express'),
    routes        = require('./routes'),
    drawingServer = require('./lib/drawing-server');

var app = module.exports = express.createServer();

// Configuration

app.configure(function() {
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

express.static.mime.define({ 'application/x-web-app-manifest+json': [ 'webapp' ] });

// Routes

routes.register(app);


// Socket IO

drawingServer.listen(app);
