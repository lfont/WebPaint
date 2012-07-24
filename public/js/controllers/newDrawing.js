/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global"
], function (global) {
    var actions,
        model = {},
        translate = function (m) {
            m.title = global.l("%newDrawing.title");
            m.background = global.l("%newDrawing.background");
        };

    return {
        components: [
            { name: "colorPicker", alias: "cPicker" }
        ],
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
            this.component("cPicker").change(function () {
                actions.newDrawing(this.value());
                global.goBackTo("#main");
            }).colors(global.getColors());
        },
        pagebeforeshow: function (req) {
            actions = req.get("actions");
        }
    };
});
