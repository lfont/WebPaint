/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "collections/colors",
    "views/colorPicker",
    "text!templates/tools.html",
    "i18n!views/nls/tools"
], function ($, Backbone, _, colorsCollection, ColorPickerView, toolsTemplate,
             toolsResources) {
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

            this.$el.trigger("create");

            return this;
        },

        initialize: function () {
            var that = this;

            this.drawer = this.options.drawer;
            this.render();

            this.shapeColorPicker = new ColorPickerView({
                el: this.$el.find(".color-picker"),
                colors: colorsCollection.getColors()
            });

            this.shapeColorPicker.on("color", function (hex) {
                that.drawer.color(hex);
            });
        },

        popupbeforeposition: function () {
            var $shapes = this.$el.find(".shape"),
                $width = this.$el.find(".width");

            $shapes.filter("[value='" + this.drawer.shape() + "']")
                   .attr("checked", true)
                   .checkboxradio("refresh");

            $width.val(this.drawer.lineWidth())
                  .slider("refresh");

            this.shapeColorPicker.value(this.drawer.color());
            this.trigger("open");
        },

        popupafterclose: function () {
            var $shape = this.$el.find(".shape:checked"),
                $width = this.$el.find(".width");

            this.drawer.shape($shape.val());
            this.drawer.lineWidth(parseInt($width.val(), 10));
            this.trigger("close");
        }
    });
});
