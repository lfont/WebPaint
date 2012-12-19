/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var imageService = require('./service/image');

exports.register = function (app) {
    app.post('/service/saveImage', imageService.save);

    app.use(function (req, res) {
        res.send('Sorry, we cannot find that!', 404);
    });
};
