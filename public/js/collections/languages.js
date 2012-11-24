/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'models/language'
], function (Backbone, LanguageModel) {
    'use strict';

    return Backbone.Collection.extend({
        model: LanguageModel
    });
});
