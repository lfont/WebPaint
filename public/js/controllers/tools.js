/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "controllers/colorPicker",
    "text!templates/tools.html",
    "i18n!controllers/nls/tools"
], function (global, colorPicker, toolsTemplate, toolsResources) {
    "use strict";

    var model = {
            r: toolsResources
        },
        colorPickerController, $shape, $width,

        messageHandlers = {
            shape: function (shape) {
                colorPickerController.select(shape.properties.strokeStyle);

                $shape
                    .find("input[value='" + shape.name + "']")
                    .attr("checked", true)
                    .checkboxradio("refresh");

                $width
                    .val(shape.properties.lineWidth)
                    .slider("refresh");
            }
        };

    return {
        pagebeforecreate: function () {
            var that = this;

            this.render(toolsTemplate, model);

            $shape = this.$el.find(".shapeList");
            $width = this.$el.find("input[name='width']");

            colorPickerController = colorPicker(global.getColors().slice(1));

            this.controller(
                "colorPicker",
                this.$el.find(".colorPickerAnchor"),
                colorPickerController);

            colorPickerController.change(function () {
                that.send("main", "color", this.value());
            });
        },
        pagebeforehide: function () {
            this.send("main", "shape", $shape.find("input:checked").val());
            this.send("main", "lineWidth", parseInt($width.val(), 10));
        },
        onMessage: function (message, data) {
            messageHandlers[message.name](data);
        }
    };
});
