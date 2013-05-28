/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define(function (require) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone');

    return function (drawerManager, guestCollection,
                     userModel, notificationManager) {
        _.extend(this, Backbone.Events);

        userModel.set('nickname', 'unknown');
        guestCollection.reset([]);

        this.sendInvite = function (nickname) {

        };

        this.sendResponse = function (nickname, accepted) {

        };
    };
});
