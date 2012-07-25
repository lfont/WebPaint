/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "i18n!controllers/nls/newDrawing"
], function (global, newDrawing) {
    var actions,
        model = {
            r: newDrawing
        };

    return {
        components: [
            { name: "colorPicker", alias: "cPicker" }
        ],
        pagebeforecreate: function () {
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
