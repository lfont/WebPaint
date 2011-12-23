var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime'),
    dir = '',
    host = '0.0.0.0',
    port = process.env.PORT;
    
process.argv.forEach(function (val) {
    var arg = val.split('=');
    
    switch (arg[0]) {
        case 'dir':
            dir = arg[1];
            break;
        case 'host':
            host = arg[1];
            break;
        case 'port':
            port = parseInt(arg[1], 10);
            break;
    }
});

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname,
        filename = path.join(process.cwd(), dir, uri);
        
    path.exists(filename, function (exists) {
        var mimeType,
            fileStream;
            
        if (!exists) {
            console.log("not exists: " + filename);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not Found\n');
            res.end();
            return;
        }
        
        if (fs.statSync(filename).isDirectory()) {
            filename += 'index.html';
        }
        
        mimeType = mime.lookup(filename);
        res.writeHead(200, {
            'Content-Type': mimeType
        });
        fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    });
}).listen(port, host);

console.log('server is running on ' + host + ':' + port);
