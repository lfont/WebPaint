/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global"
], function (global) {
    var model = {
            version: "WebPaint 0.4.6"
        },
        translate = function (m) {
            m.title = global.l("%about.title");
            m.description = global.l("%about.description");
            m.source = global.l("%about.source");
            m.follow = global.l("%about.follow");
        };

    return {
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
        }
    };
});
