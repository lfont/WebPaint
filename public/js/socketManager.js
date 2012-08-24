/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "backbone",
    "underscore",
    "lib/socket.io",
    "collections/users"
], function (Backbone, _, io, usersCollection) {
    "use strict";

    return function () {
        var that = this,
            usersSocket;

        _.extend(this, Backbone.Events);

        this.connect = function (user) {
            usersSocket = io.connect("/users");
            usersSocket.on("connect", function () {
                usersSocket.emit("set user", user.toJSON());

                usersSocket.on("ready", function (userId) {
                    user.set("id", userId);
                    that.trigger("ready", user);
                });

                usersSocket.on("users", function (users) {
                    var others = _.filter(users, function (u) {
                            return u.id !== user.get("id");
                        });

                    usersCollection.reset(others);
                });
            });
        };

        this.invite = function (userId) {
            this.trigger("invite", userId);
            usersSocket.emit("invite", userId);

            usersSocket.on("response", function (accept) {
                that.trigger("response", accept);
            });
        };
    };
});
