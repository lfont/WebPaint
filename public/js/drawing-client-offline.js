/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore'
], function (Backbone, _) {
    'use strict';

    return function (drawer, environment) {
        var guestCollection = environment.get('guests'),
            userModel       = environment.get('user');

        _.extend(this, Backbone.Events);

        userModel.set('nickname', 'unknown');
        guestCollection.reset([]);

        this.sendInvite = function (nickname) {

        };

        this.sendResponse = function (nickname, accepted) {

        };
    };
});
