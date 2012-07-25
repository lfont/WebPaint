/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "i18n!nls/colors"
], function ($, colors) {
    "use strict";

    return {
        getColors: function () {
            return [
                {
                    code: "transparent",
                    name: colors.transparent
                },
                {
                    code: "#000000",
                    name: colors.black
                },
                {
                    code: "#d2691e",
                    name: colors.chocolate
                },
                {
                    code: "#ffffff",
                    name: colors.white
                },
                {
                    code: "#ffc0cb",
                    name: colors.pink
                },
                {
                    code: "#ff0000",
                    name: colors.red
                },
                {
                    code: "#ffa500",
                    name: colors.orange
                },
                {
                    code: "#ee82ee",
                    name: colors.violet
                },
                {
                    code: "#0000ff",
                    name: colors.blue
                },
                {
                    code: "#40e0d0",
                    name: colors.turquoise
                },
                {
                    code: "#008000",
                    name: colors.green
                },
                {
                    code: "#ffff00",
                    name: colors.yellow
                }
            ];
        },
        goBackTo: function (pageName) {
            $.mobile.changePage(pageName, { reverse: true });
        }
    };
});
