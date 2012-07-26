/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "i18n!controllers/nls/about"
], function (global, about) {
    var model = {
            r: about,
            version: "WebPaint 0.4.8"
        };

    return {
        pagebeforecreate: function () {
            this.render("pagebeforecreate", model);
        }
    };
});
