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
                colorPickerController = colorPicker(global.getColors());

            this.render(newDrawingTemplate, model);

            this.controller(
                "colorPicker",
                this.$el.find(".colorPickerAnchor"),
                colorPickerController);

            colorPickerController.change(function () {
                that.send("main", "new", this.value());
                global.goBackTo("main");
            });
        }
    };
});
