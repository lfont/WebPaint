/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "global",
   "text!templates/colorPicker.html",
   "text!templates/predefinedColors.html",
   "i18n!controllers/nls/colorPicker"
], function ($, global, colorPickerTemplate, predefinedColorsTemplate, colorPickerResources) {
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

    return function (colors) {
        var hasPendingRendering = true,
            model = {
                r: colorPickerResources,
                colors: colors,
                selectedColor: null
            },
            changeHanlders = [],
            $custom, $red, $green, $blue;

        return {
            pagebeforecreate: function () {
                var colorChangeHandler = function () {
                        $custom.removeClass(SELECTED_CLASS)
                               .css("background-color", hexFromRgb(
                                    $red.val(),
                                    $green.val(),
                                    $blue.val()));
                    };
                
                $custom = this.$el.find(".colorpicker-custom-color");
                $red =  this.$el.find("input[name='red']");
                $green =  this.$el.find("input[name='green']");
                $blue =  this.$el.find("input[name='blue']");

                this.render(colorPickerTemplate, model);

                $red.change(colorChangeHandler);
                $green.change(colorChangeHandler);
                $blue.change(colorChangeHandler).change();
            },
            pagebeforeshow: function () {
                if (hasPendingRendering) {
                    this.render(
                        predefinedColorsTemplate,
                        this.$el.find(".predefinedColorsAnchor"),
                        model);

                    hasPendingRendering = false;
                }
            },
            hasPredefinedColor: function (color) {
                var contains = false;
                
                $.each(model.colors, function (nr, val) {
                    if (val.code === color) {
                        contains = true;
                        return false;
                    }
                });
                
                return contains;
            },
            select: function (color) {
                var rgb;
                
                model.selectedColor = color;
                if (this.hasPredefinedColor(color)) {
                    $custom.removeClass(SELECTED_CLASS);
                } else {
                    rgb = rgbFromHex(color);
                    $red.val(rgb.r).slider("refresh");
                    $green.val(rgb.g).slider("refresh");
                    $blue.val(rgb.b).slider("refresh").change();
                    $custom.addClass(SELECTED_CLASS);
                }
                hasPendingRendering = true;

                return this;
            },
            change: function (handler) {
                var i, len;

                if (handler && typeof handler === "function") {
                    changeHanlders.push(handler);
                } else {
                    for (i = 0, len = changeHanlders.length; i < len; i++) {
                        changeHanlders[i].call(this);
                    }
                }

                return this;
            },
            value: function (context) {
                var color;

                if (context) {
                    color = context.get("color");
                    if (color === "custom") {
                        color = hexFromRgb(
                            $red.val(),
                            $green.val(),
                            $blue.val());

                        $custom.addClass(SELECTED_CLASS);
                    } else {
                        $custom.removeClass(SELECTED_CLASS);
                    }
                    model.selectedColor = color;
                    this
                        .render(predefinedColorsTemplate,
                            this.$el.find(".predefinedColorsAnchor"),
                            model)
                        .change();
                }

                return model.selectedColor;
            }
        };
    };
});
