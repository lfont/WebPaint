var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),
    service = require("./lib/service.js"),
    dir = path.join("app", "public"),
    host = "127.0.0.1",
    port = process.env.PORT;
    
process.argv.forEach(function (val) {
    var arg = val.split("=");

    switch (arg[0]) {
        case "dir":
            dir = arg[1];
            break;
        case "host":
            host = arg[1];
            break;
        case "port":
            port = parseInt(arg[1], 10);
            break;
    }
});

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname,
        filename = path.join(process.cwd(), dir, uri);
        
    if (uri.indexOf("service/") > -1) {
        service.call(req, res);
        return;
    }
        
    path.exists(filename, function (exists) {
        var fileStream;
            
        if (!exists) {
            console.log("not exists: " + filename);
            res.writeHead(200, {
                "Content-Type": "text/plain"
            });
            res.write("404 Not Found\n");
            res.end();
            return;
        }
        
        if (fs.statSync(filename).isDirectory()) {
            filename += "index.html";
        }

        res.writeHead(200, {
            "Content-Type": mime.lookup(filename)
        });
        fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    });
}).listen(port, host);

console.log("server is running on " + host + ":" + port);
