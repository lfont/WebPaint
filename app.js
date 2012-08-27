/**
 * Module dependencies.
 */

var express = require("express"),
    app = module.exports = express.createServer(),
    qs = require("querystring"),
    io = require("socket.io"),
    users = [];


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

io.listen(app)
    .sockets
    .on("connection", function (socket) {
        socket.emit("users", users.map(function (user) {
            return {
                nickname: user.nickname
            };
        }));

        socket.on("connect-user", function (nickname) {
            var user = {
                nickname: nickname,
                socket: socket
            };
            users.push(user);

            socket.set("user", user, function () {
                socket.emit("user-connected");
            });

            socket.broadcast.emit("users", users.map(function (u) {
                return {
                    nickname: u.nickname
                };
            }));
        });

        socket.on("disconnect", function () {
            socket.get("user", function (err, user) {
                users = users.filter(function (u) {
                    return u.nickname !== user.nickname;
                });

                socket.broadcast.emit("users", users.map(function (u) {
                    return {
                        nickname: u.nickname
                    };
                }));
            });
        });

        // invite messages
        socket.on("invite-request", function (nickname) {
            socket.get("user", function (err, user) {
                var to = users.filter(function (u) {
                        return u.nickname === nickname;
                    });

                to[0].socket.emit("invite-request", user.nickname);
            });
        });

        socket.on("invite-response", function (response) {
            socket.get("user", function (err, user) {
                var to = users.filter(function (u) {
                        return u.nickname === response.replyTo;
                    });

                to[0].socket.emit("invite-response", {
                    sender: user.nickname,
                    accepted: response.accepted
                });
            });
        });

        // drawer messages
        socket.on("draw", function (data) {
            socket.get("user", function (err, user) {
                var to = users.filter(function (u) {
                        return u.nickname === data.to;
                    });

                // TODO: manage authorization
                to[0].socket.emit("draw", {
                    sender: user.nickname,
                    shape: data.shape
                });
            });
        });
    });
