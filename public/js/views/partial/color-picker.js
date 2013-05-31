/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/partial/color-picker.html',
    'i18n!nls/color-picker-view'
], function (require, colorPickerTemplate, colorPickerResources) {
    'use strict';

    var $        = require('jquery'),
        _        = require('underscore'),
        Backbone = require('backbone');
    
    var SELECTED_CLASS = 'colorpicker-color-selected';

    function hexFromRgb (r, g, b) {
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
    }

    function rgbFromHex (hex) {
        var match = /([\da-f]{2})([\da-f]{2})([\da-f]{2})/.exec(hex);

        if (match && match.length === 4) {
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        }

        return null;
    }

    var ColorPickerView = Backbone.View.extend({
        className: 'color-picker',
        
        events: {
            'change .colorpicker-red': 'customColorUpdated',
            'change .colorpicker-green': 'customColorUpdated',
            'change .colorpicker-blue': 'customColorUpdated',
            'vclick .colorpicker-custom-color': 'colorSelected',
            'vclick .colorpicker-predefined-color': 'colorSelected'
        },

        template: _.template(colorPickerTemplate),

        initialize: function () {
            this._$customColor = null;
            this._$predefinedColors = null;
            this._$red = null;
            this._$green = null;
            this._$blue = null;
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: colorPickerResources,
                    colors: this.collection.toJSON()
                }));

            this._$customColor = this.$el.find('.colorpicker-custom-color');
            this._$predefinedColors = this.$el.find('.colorpicker-predefined-color');
            
            this.setCustomColor('#000000');

            return this;
        },
        
        bindWidgets: function () {
            if (this._$red) {
                return;
            }
            
            this._$red = this.$el.find('.colorpicker-red');
            this._$green = this.$el.find('.colorpicker-green');
            this._$blue = this.$el.find('.colorpicker-blue');
        },
        
        setCustomColor: function (hex) {
            this._$customColor.removeClass(SELECTED_CLASS)
                              .css('background-color', hex)
                              .attr('data-value', hex);
        },

        customColorUpdated: function () {
            var hex;
            
            this.bindWidgets();
            
            hex = hexFromRgb(this._$red.val(),
                             this._$green.val(),
                             this._$blue.val());

            this.setCustomColor(hex);
        },

        colorSelected: function (event) {
            var $this = $(event.target),
                hex = $this.attr('data-value');

            this._$customColor.removeClass(SELECTED_CLASS);
            this._$predefinedColors.removeClass(SELECTED_CLASS);
            $this.addClass(SELECTED_CLASS);

            this.trigger('color', hex);
        },

        hasPredefinedColor: function (code) {
            return this.collection.any(function (color) {
                return color.get('code') === code;
            });
        },

        value: function (hex) {
            var rgb;

            if (this.hasPredefinedColor(hex)) {
                this._$customColor.removeClass(SELECTED_CLASS);

                this._$predefinedColors.filter('[data-value="' + hex + '"]')
                                       .addClass(SELECTED_CLASS);
            } else {
                this.bindWidgets();
                
                rgb = rgbFromHex(hex);

                this._$red.val(rgb.r).slider('refresh');
                this._$green.val(rgb.g).slider('refresh');
                this._$blue.val(rgb.b).slider('refresh');

                this._$customColor.addClass(SELECTED_CLASS);
            }

            return this;
        }
    });

    return ColorPickerView;
});
