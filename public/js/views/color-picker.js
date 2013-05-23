/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/color-picker.html',
    'i18n!nls/color-picker-view'
], function ($, Backbone, _, colorPickerTemplate, colorPickerResources) {
    'use strict';

    var SELECTED_CLASS = 'colorpicker-color-selected',

        hexFromRgb = function (r, g, b) {
            var hex = [
                    parseInt(r, 10).toString(16),
                    parseInt(g, 10).toString(16),
                    parseInt(b, 10).toString(16)
                ];

            _.each(hex, function (number, index) {
                if (number.length === 1) {
                    hex[index] = '0' + number;
                }
            });

            return '#' + hex.join('');
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
            'change .colorpicker-red': 'customColorUpdated',
            'change .colorpicker-green': 'customColorUpdated',
            'change .colorpicker-blue': 'customColorUpdated',
            'vclick .colorpicker-custom-color': 'colorSelected',
            'vclick .colorpicker-predefined-color': 'colorSelected'
        },

        template: _.template(colorPickerTemplate),

        render: function () {
            this.$el
                .html(this.template({
                    r: colorPickerResources,
                    colors: this.options.colors.toJSON()
                }));

            this.$el.trigger('create');

            this.customColorUpdated();

            return this;
        },

        customColorUpdated: function () {
            var $customColor = this.$el.find('.colorpicker-custom-color'),
                $red = this.$el.find('.colorpicker-red'),
                $green = this.$el.find('.colorpicker-green'),
                $blue = this.$el.find('.colorpicker-blue'),
                hex = hexFromRgb($red.val(), $green.val(), $blue.val());

            $customColor.removeClass(SELECTED_CLASS)
                        .css('background-color', hex)
                        .attr('data-value', hex);
        },

        colorSelected: function (event) {
            var $this = $(event.target),
                $customColor = this.$el.find('.colorpicker-custom-color'),
                $predefinedColors = this.$el.find('.colorpicker-predefined-color'),
                hex = $this.attr('data-value');

            $customColor.removeClass(SELECTED_CLASS);
            $predefinedColors.removeClass(SELECTED_CLASS);
            $this.addClass(SELECTED_CLASS);

            this.trigger('color', hex);
        },

        hasPredefinedColor: function (code) {
            return this.options.colors.any(function (color) {
                return color.get('code') === code;
            });
        },

        value: function (hex) {
            var $customColor = this.$el.find('.colorpicker-custom-color'),
                $predefinedColors, $red, $green, $blue, rgb;

            if (this.hasPredefinedColor(hex)) {
                $customColor.removeClass(SELECTED_CLASS);

                $predefinedColors = this.$el.find('.colorpicker-predefined-color');
                $predefinedColors.filter('[data-value="' + hex + '"]')
                                 .addClass(SELECTED_CLASS);
            } else {
                rgb = rgbFromHex(hex);

                $red = this.$el.find('.colorpicker-red');
                $red.val(rgb.r).slider('refresh');

                $green = this.$el.find('.colorpicker-green');
                $green.val(rgb.g).slider('refresh');

                $blue = this.$el.find('.colorpicker-blue');
                $blue.val(rgb.b).slider('refresh');

                $customColor.addClass(SELECTED_CLASS);
            }

            return this;
        }
    });
});
