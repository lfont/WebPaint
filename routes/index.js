/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var imageApi = require('./api/image');

exports.register = function (app) {
    app.post('/api/image/download', imageApi.download);

    app.use(function (req, res) {
        res.send('Sorry, we cannot find that!', 404);
    });
};
