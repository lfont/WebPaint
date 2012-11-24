/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'i18n!nls/color-model'
], function (Backbone, colorResources) {
    'use strict';

    return Backbone.Model.extend({
        initialize: function (color) {
            this.set('name', colorResources[color.code]);
        }
    });
});
