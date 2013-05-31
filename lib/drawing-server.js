/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var socketio = require('socket.io');

var guestNumber = 1,
    nickNames = {},
    currentRoom = {};

function assignGuestName (socket) {
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    guestNumber++;
}

exports.listen = function (server) {
    var io = socketio.listen(server);

    io.configure('production', function () {
        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        
        io.set('log level', 1);

        // Heroku does not support WebSocket.
        io.set('transports', [ 'xhr-polling' ]);
        io.set('polling duration', 10);
    });

    function emitGuests () {
        var guests = [],
            socketId;

        for (socketId in nickNames) {
            if (nickNames.hasOwnProperty(socketId)) {
                guests.push(nickNames[socketId]);
            }
        }

        io.sockets.emit('guests', guests);
    }

    function getGuestSocket (nickname) {
        var sockets = io.sockets.clients(),
            guestSocket = null,
            i, len, socket;

        for (i = 0, len = sockets.length; i < len; i++) {
            socket = sockets[i];
            if (nickNames[socket.id] === nickname) {
                guestSocket = socket;
                break;
            }
        }

        return guestSocket;
    }

    function joinRoom (socket, room) {
        var previousRoom = currentRoom[socket.id];

        if (previousRoom && previousRoom !== room) {
            socket.broadcast.to(previousRoom).emit('message', {
                text: nickNames[socket.id] + ' left.'
            });
        }

        currentRoom[socket.id] = room;
        socket.join(room);

        socket.broadcast.to(room).emit('message', {
            text: nickNames[socket.id] + ' has joined.'
        });
    }

    function handleInviteGuestRequest (socket) {
        socket.on('inviteGuestRequest', function (nickname) {
            var guestSocket = getGuestSocket(nickname);
            guestSocket.emit('inviteRequest', {
                from: nickNames[socket.id]
            });
        });
    }

    function handleInviteGuestResponse (socket) {
        socket.on('inviteGuestResponse', function (response) {
            var guestSocket = getGuestSocket(response.to);

            if (response.status === 'accepted') {
                joinRoom(guestSocket, guestSocket.id);
                joinRoom(socket, guestSocket.id);
            }

            guestSocket.emit('inviteResponse', {
                from: nickNames[socket.id],
                status: response.status
            });
        });
    }

    function handleDrawing (socket) {
        var notDefined;

        socket.on('draw', function (shape) {
            var room = currentRoom[socket.id];

            if (room === notDefined) {
                return;
            }

            socket.broadcast.to(room).emit('draw', {
                from: nickNames[socket.id],
                shape: shape
            });
        });
    }

    function handleClientDisconnection (socket) {
        var notDefined;

        socket.on('disconnect', function () {
            var room = currentRoom[socket.id];

            if (room !== notDefined) {
                socket.broadcast.to(room).emit('message', {
                    text: nickNames[socket.id] + ' left.'
                });
            }

            delete nickNames[socket.id];
            delete currentRoom[socket.id];
            emitGuests();
        });
    }

    io.sockets
      .on('connection', function (socket) {
            assignGuestName(socket);
            emitGuests();
            handleInviteGuestRequest(socket);
            handleInviteGuestResponse(socket);
            handleDrawing(socket);
            handleClientDisconnection(socket);
        });
};
