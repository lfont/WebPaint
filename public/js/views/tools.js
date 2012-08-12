/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "global",
    "models/settings",
    "collections/colors",
    "views/colorPicker",
    "text!templates/tools.html",
    "i18n!views/nls/tools"
], function ($, Backbone, _, global, settingsModel, colorsCollection,
             ColorPickerView, toolsTemplate, toolsResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "popupbeforeposition": "popupbeforeposition",
            "popupafterclose": "popupafterclose"
        },

        template: _.template(toolsTemplate),

        render: function () {
            this.$el.html(this.template({
                r: toolsResources
            }));

            return this;
        },

        initialize: function () {
            var that = this;

            this.render();

            this.shapeColorPicker = new ColorPickerView({
                el: this.$el.find(".color-picker"),
                colors: colorsCollection.getColors()
            });

            this.shapeColorPicker.on("color", function (code) {
                that.trigger("color", code);
            });
        },

        popupbeforeposition: function () {
            var $shapes = this.$el.find(".shape"),
                $width = this.$el.find(".width");

            $shapes.filter("[value='" + settingsModel.get("shape") + "']")
                   .attr("checked", true)
                   .checkboxradio("refresh");

            $width.val(settingsModel.get("lineWidth"))
                  .slider("refresh");

            this.shapeColorPicker.value(settingsModel.get("strokeStyle"));
            this.trigger("open");
        },

        popupafterclose: function () {
            var $shape = this.$el.find(".shape:checked"),
                $width = this.$el.find(".width");

            this.trigger("shape", $shape.val());
            this.trigger("lineWidth", parseInt($width.val(), 10));
            this.trigger("close");
        }
    });
});
