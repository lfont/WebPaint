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
    "text!templates/newDrawing.html",
    "i18n!views/nls/newDrawing"
], function ($, Backbone, _, colorsCollection, ColorPickerView,
             newDrawingTemplate, newDrawingResources) {
    "use strict";

    var NewDrawing = Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate"
        },

        template: _.template(newDrawingTemplate),

        render: function () {
            this.$el.html(this.template({
                r: newDrawingResources
            }));

            return this;
        },

        pagebeforecreate: function () {
            var that = this;

            this.render();

            this.backgroundColorPicker = new ColorPickerView({
                el: this.$el.find(".color-picker")[0],
                colors: colorsCollection
            });

            this.backgroundColorPicker.on("color", function (code) {
                that.trigger("newDrawing", code);
            });
        }
    });

    return new NewDrawing({ el: $("#newDrawing")[0] });
});
