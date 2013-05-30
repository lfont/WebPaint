/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var qs = require('querystring');

exports.download = function (req, res) {
    var data = '';

    req.on('data', function (chunk) {
        data += chunk.toString();
    });
    
    req.on('end', function () {
        var body = qs.parse(data),
            name = body.name,
            image = new Buffer(
                body.data.replace('data:image/png;base64,', ''),
                'base64');
        
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length,
            'Content-Disposition': 'attachment; filename=' + name
        });
        
        res.end(image);
    });
};
