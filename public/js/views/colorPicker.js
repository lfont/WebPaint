/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "global",
    "text!templates/colorPicker.html",
    "i18n!views/nls/colorPicker"
], function ($, Backbone, _, global, colorPickerTemplate,
             colorPickerResources) {
    "use strict";
    
    var SELECTED_CLASS = "colorpicker-color-selected",

        hexFromRgb = function (r, g, b) {
            var hex = [
                    parseInt(r, 10).toString(16),
                    parseInt(g, 10).toString(16),
                    parseInt(b, 10).toString(16)
                ];

            $.each(hex, function (nr, val) {
                if (val.length === 1) {
                    hex[nr] = "0" + val;
                }
            });

            return "#" + hex.join("");
        },

        rgbFromHex = function (hex) {
            var match = /([\da-f]{2})([\da-f]{2})([\da-f]{2})/.exec(hex);
            
            if (match && match.length === 4) {
                return {
                    r: parseInt(match[1], 16),
                    g: parseInt(match[2], 16),
                    b: parseInt(match[3], 16)
                };
            }
            
            return null;
        };

    return Backbone.View.extend({
        events: {
            "change .colorpicker-red": "updateCustomColor",
            "change .colorpicker-green": "updateCustomColor",
            "change .colorpicker-blue": "updateCustomColor",
            "vclick .colorpicker-custom-color": "colorSelected",
            "vclick .colorpicker-predefined-color": "colorSelected"
        },

        template: _.template(colorPickerTemplate),

        render: function () {
            this.$el.html(this.template({
                r: colorPickerResources,
                colors: this.options.colors.toJSON()
            }));

            this.updateCustomColor();

            return this;
        },

        initialize: function () {
            this.render();
        },

        updateCustomColor: function () {
            var $customColor = this.$el.find(".colorpicker-custom-color"),
                $red = this.$el.find(".colorpicker-red"),
                $green = this.$el.find(".colorpicker-green"),
                $blue = this.$el.find(".colorpicker-blue"),
                hex = hexFromRgb($red.val(), $green.val(), $blue.val());

            $customColor.removeClass(SELECTED_CLASS)
                        .css("background-color", hex)
                        .attr("data-value", hex);
        },

        colorSelected: function (event) {
            var $this = $(event.target),
                $customColor = this.$el.find(".colorpicker-custom-color"),
                $predefinedColors = this.$el.find(".colorpicker-predefined-color"),
                hex = $this.attr("data-value");

            $customColor.removeClass(SELECTED_CLASS);
            $predefinedColors.removeClass(SELECTED_CLASS);

            $this.addClass(SELECTED_CLASS);

            this.trigger("color", hex);
        },

        hasPredefinedColor: function (code) {
            return this.options.colors.any(function (color) {
                return color.get("code") === code;
            });
        },

        value: function (hex) {
            var $customColor = this.$el.find(".colorpicker-custom-color"),
                $predefinedColors = this.$el.find(".colorpicker-predefined-color"),
                $red = this.$el.find(".colorpicker-red"),
                $green = this.$el.find(".colorpicker-green"),
                $blue = this.$el.find(".colorpicker-blue"),
                rgb;
            
            if (this.hasPredefinedColor(hex)) {
                $customColor.removeClass(SELECTED_CLASS);
                $predefinedColors.find("[data-value='" + hex + "']")
                                 .addClass(SELECTED_CLASS);
            } else {
                rgb = rgbFromHex(hex);
                $red.val(rgb.r).slider("refresh");
                $green.val(rgb.g).slider("refresh");
                $blue.val(rgb.b).slider("refresh");
                $customColor.addClass(SELECTED_CLASS)
                            .css("background-color", hex);
            }

            return this;
        }
    });
});
