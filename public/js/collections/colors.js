/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "backbone",
    "models/color"
], function (Backbone, ColorModel) {
    "use strict";

    var Colors = Backbone.Collection.extend({
        model: ColorModel,

        withoutTransparent: function () {
            var colors = this.reject(function (color) {
                return color.get("code") === "transparent";
            });

            return new Colors(colors);
        }
    });

    return new Colors([
        { code: "transparent" },
        { code: "#000000" },
        { code: "#d2691e" },
        { code: "#ffffff" },
        { code: "#ffc0cb" },
        { code: "#ff0000" },
        { code: "#ffa500" },
        { code: "#ee82ee" },
        { code: "#0000ff" },
        { code: "#40e0d0" },
        { code: "#008000" },
        { code: "#ffff00" }
    ]);
});
