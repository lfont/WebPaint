/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'socket.io',
    'sprintf',
    'i18n!nls/drawing-client'
], function (Backbone, _, socketio, sprintf, drawingClientResources) {
    'use strict';
        
    return function (drawerManager, guestCollection,
                     userModel, notificationManager) {
        var _this               = this,
            socket              = socketio.connect('/'),
            inviteCancelationTimeoutId;

        _.extend(this, Backbone.Events);

        function hasPendingRequest () {
            var notDefined;

            return inviteCancelationTimeoutId !== notDefined &&
                   inviteCancelationTimeoutId !== null;
        }

        socket.on('nameResult', function (result) {
            userModel.set('nickname', result.name);

            drawerManager.addDrawnHandler(function (shape) {
                socket.emit('draw', shape);
            });

            socket.on('draw', function (data) {
                drawerManager.draw(data.shape);
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
                        _this.trigger('inviteRequestCanceled', request.from);
                        socket.emit('inviteGuestResponse', {
                            to: request.from,
                            status: 'busy'
                        });
                    }, 15000);
                }
            });

            socket.on('inviteResponse', function (response) {
                var message;
                
                switch (response.status) {
                case 'accepted':
                    message = drawingClientResources.inviteAccepted;
                    break;
                case 'rejected':
                    message = drawingClientResources.inviteRejected;
                    break;
                default:
                    message = drawingClientResources.inviteBusy;
                }

                _this.trigger('inviteResponse', response.from, response.status);
                notificationManager.push(sprintf(message, response.from));
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
                notificationManager.push(message.text);
            });
        });

        this.sendInvite = function (nickname) {
            _this.trigger('inviteGuestRequest', nickname);
            notificationManager.push(sprintf(drawingClientResources.invitePending,
                                             nickname));
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
