/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'models/color'
], function (Backbone, ColorModel) {
    'use strict';

    var Colors = Backbone.Collection.extend({
        model: ColorModel,

        getDrawableColors: function () {
            return new Colors(this.reject(function (color) {
                return color.get('code') === 'transparent';
            }));
        }
    });

    return Colors;
});
