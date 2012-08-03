/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "controllers/colorPicker",
    "text!templates/newDrawing.html",
    "i18n!controllers/nls/newDrawing"
], function (global, colorPicker, newDrawingTemplate, newDrawingResources) {
    "use strict";

    var model = {
            r: newDrawingResources
        };

    return {
        pagebeforecreate: function () {
            var that = this,
                backgroundColorPicker = colorPicker();

            this.render(newDrawingTemplate, model);

            this.add(
                "colorPicker",
                ".colorPickerAnchor",
                backgroundColorPicker,
                global.getColors());

            backgroundColorPicker.change(function () {
                that.emit("new", this.value());
                global.goBackTo("main");
            });
        }
    };
});
