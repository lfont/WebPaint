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
    "text!/templates/newDrawing.html",
    "i18n!views/nls/newDrawing"
], function ($, Backbone, _, colorsCollection, ColorPickerView,
             newDrawingTemplate, newDrawingResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pagebeforeshow": "pagebeforeshow",
            "pagehide": "pagehide"
        },

        template: _.template(newDrawingTemplate),

        render: function () {
            this.$el.html(this.template({
                r: newDrawingResources
            }));

            return this;
        },

        initialize: function () {
            this.drawer = this.options.drawer;
        },

        pagebeforecreate: function () {
            var that = this;

            this.render();

            this.backgroundColorPicker = new ColorPickerView({
                el: this.$el.find(".color-picker"),
                colors: colorsCollection
            });

            this.backgroundColorPicker.on("color", function (hex) {
                that.drawer.newDrawing(hex);
                $.mobile.changePage("#main", { reverse: true });
            });
        },

        pagebeforeshow: function () {
            this.trigger("open");
        },

        pagehide: function () {
            this.trigger("close");
        }
    });
});
