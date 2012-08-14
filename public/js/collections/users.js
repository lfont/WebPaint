/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "backbone",
    "models/user"
], function (Backbone, UserModel) {
    "use strict";

    var Users = Backbone.Collection.extend({
        model: UserModel
    });

    return new Users([
    
    ]);
});
