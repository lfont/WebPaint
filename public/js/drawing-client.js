/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'i18n!nls/drawing-client'
], function (require, drawingClientResources) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone'),
        sprintf  = require('sprintf');
        
    function DrawingClient (app) {
        var drawerManager = app.drawerManager,
            guestCollection = app.guests,
            userModel = app.user,
            notificationManager = app.notificationManager;
                     
        var _this = this,
            socket,
            inviteCancelationTimeoutId;

        _.extend(this, Backbone.Events);

        function hasPendingRequest () {
            var notDefined;

            return inviteCancelationTimeoutId !== notDefined &&
                   inviteCancelationTimeoutId !== null;
        }
        
        function onLocalDraw (shape) {
            if (socket) {
                socket.emit('draw', shape);
            }
        }
        
        function onRemoteDraw (data) {
            drawerManager.draw(data.shape);
        }
        
        function onInviteRequest (request) {
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
        }
        
        function onInviteResponse (response) {
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
        }
        
        function onNewGuests (nicknames) {
            var myNickname = userModel.get('nickname'),
                others = [];
    
            nicknames.forEach(function (nickname) {
                if (nickname !== myNickname) {
                    others.push({ nickname: nickname });
                }
            });
    
            guestCollection.reset(others);
        }
        
        function onMessage (message) {
            _this.trigger('message', message.text);
            notificationManager.push(message.text);
        }

        this.sendInvite = function (nickname) {
            if (!socket) {
                return;
            }
            
            _this.trigger('inviteGuestRequest', nickname);
            notificationManager.push(sprintf(drawingClientResources.invitePending,
                                             nickname));
            socket.emit('inviteGuestRequest', nickname);
        };

        this.sendResponse = function (nickname, accepted) {
            if (!socket) {
                return;
            }
            
            clearTimeout(inviteCancelationTimeoutId);
            inviteCancelationTimeoutId = null;
            socket.emit('inviteGuestResponse', {
                to: nickname,
                status: accepted ? 'accepted' : 'rejected'
            });
        };
        
        this.disconnect = function () {
            if (socket) {
                socket.disconnect();
            }
        };
        
        // start
        drawerManager.addDrawnHandler(onLocalDraw);
        
        app
        .on('online', function () {
            if (socket) {
                return;
            }
            
            require([
                'socket.io'
            ], function (socketio) {
                socket = socketio.connect('/');
                
                socket.on('nameResult', function (result) {
                    userModel.set('nickname', result.name);
                    
                    socket.on('draw', onRemoteDraw);
                    socket.on('inviteRequest', onInviteRequest);
                    socket.on('inviteResponse', onInviteResponse);
                    socket.on('guests', onNewGuests);
                    socket.on('message', onMessage);
                });
            });
        })
        .on('offline', function () {
            guestCollection.reset();
        });
    }
    
    return DrawingClient;
});
