/**
 * Module dependencies.
 */

var express = require("express"),
    app = module.exports = express.createServer(),
    qs = require("querystring"),
    io = require("socket.io"),
    users = [],
    lastUserId = 0,
    sio;


// Configuration

app.configure(function() {
    app.use(app.router);
    app.use(express.static(__dirname + "/public"));
});

app.configure("development", function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure("production", function() {
    app.use(express.errorHandler());
});


// Routes

app.post("/service/saveAs/:name", function (req, res) {
    var data = "",
        fileName = req.param("name");

    req.on("data", function (chunk) {
        data += chunk.toString();
    });
    
    req.on("end", function () {
        var body = qs.parse(data),
            image = new Buffer(
                body.dataURL.replace("data:image/png;base64,", ""),
                "base64");
        
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": image.length,
            "Content-Disposition": "attachment; filename=" + fileName
        });
        
        res.end(image);
    });
});


// Start

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Express server listening on port %d in %s mode",
        app.address().port, app.settings.env);
});


// Socket.IO

sio = io.listen(app);

sio.of("/users")
    .on("connection", function (socket) {
        socket.emit("users", users);

        socket.on("set user", function (user) {
            user.id = lastUserId++;
            users.push(user);

            socket.set("user", user, function () {
                socket.emit("ready", user.id);
            });

            socket.broadcast.emit("users", users);
        });

        socket.on("invite", function (userId) {
            setTimeout(3000, function () {
                socket.emit("response", true);
            });
        });

        socket.on("disconnect", function () {
            socket.get("user", function (err, user) {
                users = users.filter(function (val) {
                    return val.id !== user.id;
                });

                socket.broadcast.emit("users", users);
            });
        });
    });
