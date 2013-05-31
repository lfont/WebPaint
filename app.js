/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var package = require('./package.json'),
    express = require('express'),
    routes  = require('./routes');

var app = module.exports = express(),
    appConfig = {
        name: package.name,
        version: package.version
    };

// Configuration

app.configure(function () {
    app.use(express.favicon(__dirname + '/public/img/icon-32.png'));
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    
    appConfig.environment = 'development';
});

app.configure('production', function () {
    app.use(express.static(__dirname + '/public-build'));
    app.use(express.errorHandler());
    
    appConfig.environment = 'production';
});

express.static.mime.define({ 'application/x-web-app-manifest+json': [ 'webapp' ] });
express.static.mime.define({ 'text/cache-manifest': [ 'appcache' ] });

// Routes

app.get('/config.json', function (req, res) {
    appConfig.installOrigin = appConfig.environment === 'production' ?
        'http://webpaint.lfont.me' :
        'http://localhost:' + app.get('port');
    
    res.send(appConfig);
});

routes.register(app);
