/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'socket.io'
], function (Backbone, _, socketio) {
    'use strict';
        
    return function (drawer, environment) {
        var _this                      = this,
            socket                     = socketio.connect('/'),
            guestCollection            = environment.get('guests'),
            userModel                  = environment.get('user'),
            inviteCancelationTimeoutId;

        _.extend(this, Backbone.Events);

        function hasPendingRequest () {
            var notDefined;

            return inviteCancelationTimeoutId !== notDefined &&
                   inviteCancelationTimeoutId !== null;
        }

        socket.on('nameResult', function (result) {
            userModel.set('nickname', result.name);

            drawer.addDrawnHandler(function (shape) {
                socket.emit('draw', shape);
            });

            socket.on('draw', function (data) {
                drawer.draw(data.shape);
            });

            socket.on('inviteRequest', function (request) {
                if (hasPendingRequest()) {
                    socket.emit('inviteGuestResponse', {
                        to: request.from,
                        status: 'busy'
                    });
                } else {
                    _this.trigger('inviteRequest', request.from);
                    inviteCancelationTimeoutId = setTimeout(function () {
                        inviteCancelationTimeoutId = null;
                        _this.trigger('inviteRequestCanceled');
                        socket.emit('inviteGuestResponse', {
                            to: request.from,
                            status: 'busy'
                        });
                    }, 15000);
                }
            });

            socket.on('inviteResponse', function (response) {
                _this.trigger('inviteResponse', response.from, response.status);
            });

            socket.on('guests', function (nicknames) {
                var myNickname = userModel.get('nickname'),
                    others = [];

                    nicknames.forEach(function (nickname) {
                        if (nickname !== myNickname) {
                            others.push({ nickname: nickname });
                        }
                    });

                guestCollection.reset(others);
            });

            socket.on('message', function (message) {
                _this.trigger('message', message.text);
            });
        });

        this.sendInvite = function (nickname) {
            _this.trigger('inviteGuestRequest', nickname);
            socket.emit('inviteGuestRequest', nickname);
        };

        this.sendResponse = function (nickname, accepted) {
            clearTimeout(inviteCancelationTimeoutId);
            inviteCancelationTimeoutId = null;
            socket.emit('inviteGuestResponse', {
                to: nickname,
                status: accepted ? 'accepted' : 'rejected'
            });
        };
    };
});
