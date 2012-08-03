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
        shapeColorPicker, $shape, $width;

    return {
        initialize: function () {
            this.on({
                shapeChange: function (sender, shape) {
                    shapeColorPicker.select(shape.properties.strokeStyle);

                    $shape
                        .find("input[value='" + shape.name + "']")
                        .attr("checked", true)
                        .checkboxradio("refresh");

                    $width
                        .val(shape.properties.lineWidth)
                        .slider("refresh");
                }
            });
        },
        pagebeforecreate: function () {
            var that = this;

            this.render(toolsTemplate, model);

            $shape = this.find(".shapeList");
            $width = this.find("input[name='width']");

            shapeColorPicker = colorPicker();

            this.add(
                "colorPicker",
                ".colorPickerAnchor",
                shapeColorPicker,
                global.getColors().slice(1));

            shapeColorPicker.change(function () {
                that.emit("color", this.value());
            });
        },
        pagebeforehide: function () {
            this.emit("shape", $shape.find("input:checked").val());
            this.emit("lineWidth", parseInt($width.val(), 10));
        }
    };
});
