/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'socket.io',
    'models/user'
], function (Backbone, _, io, UserModel) {
    'use strict';

    return function (userCollection) {
        var that = this,
            socket;

        _.extend(this, Backbone.Events);

        this.connect = function (user) {
            socket = io.connect('/');

            socket.on('connect', function () {
                socket.emit('connect-user', user.get('nickname'));

                socket.on('user-connected', function () {
                    that.trigger('connected');

                    // invite messages
                    socket.on('invite-request', function (sender) {
                        that.trigger('invite-request',
                                     new UserModel({
                                        nickname: sender
                                     }));
                    });

                    socket.on('invite-response', function (response) {
                        response.sender = new UserModel({
                            nickname: response.sender
                        });
                        that.trigger('invite-response', response);
                    });

                    // drawer messages
                    socket.on('draw', function (data) {
                        data.sender = new UserModel({
                            nickname: data.sender
                        });
                        that.trigger('draw', data);
                    });
                });

                socket.on('users', function (users) {
                    var others = _.filter(users, function (u) {
                            return u.nickname !== user.get('nickname');
                        });

                    userCollection.reset(others);
                });
            });
        };

        this.invite = function (nickname) {
            var user = userCollection.find(function (user) {
                    return user.get('nickname') === nickname;
                });

            that.trigger('invite', user);
            socket.emit('invite-request', user.get('nickname'));
        };

        this.acceptInvite = function (fromNickname) {
            var user = userCollection.find(function (user) {
                    return user.get('nickname') === fromNickname;
                });

            that.trigger('invite-accepted', user);
            socket.emit('invite-response', {
                replyTo: user.get('nickname'),
                accepted: true
            });
        };

        this.rejectInvite = function (fromNickname) {
            socket.emit('invite-response', {
                replyTo: fromNickname,
                accepted: false
            });
        };

        this.draw = function (data) {
            data.to = data.to.get('nickname');
            socket.emit('draw', data);
        };
    };
});
