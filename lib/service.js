var url = require("url"),
    qs = require("querystring"),
    respond = function (res, code, header, data) {
        res.writeHead(code, header);
        res.end(data);
    },
    methods = {
        saveAs: function (param, req, res) {
            var body = "";
            
            if (req.method !== "POST") {
                respond(res, 400, { "Content-Type": "text/plain" },
                    "Data must be posted to this service.");
                return;
            }
            
            req.on("data", function (chunk) {
                body += chunk.toString();
            });
            
            req.on("end", function () {
                var query = qs.parse(body),
                    image = new Buffer(query.dataURL
                        .replace("data:image/png;base64,", ""), "base64");
                
                respond(res, 200, {
                        "Content-Type": "image/png",
                        "Content-Length": image.length,
                        "Content-Disposition" : "attachment; filename=" + param
                    }, image);
            });
        }
    },
    getService = function (path) {
        var captures = /service\/(\w+)(?:\/([\w.]+))?/.exec(path);
            
        if (captures && captures.length > 1) {
            var method = methods[captures[1]];
            
            if (method) {
                return {
                    method: method,
                    param: captures[2]
                };
            }
        }
        
        return null;
    };

exports.call = function (req, res) {
    var path = url.parse(req.url).pathname,
        service = getService(path);
    
    if (!service) {
        respond(res, 200, { "Content-Type": "text/plain" },
            "404 Service not Found");
        return;
    }
    
    service.method(service.param, req, res);
};
