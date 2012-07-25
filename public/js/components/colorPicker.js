/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "global",
   "i18n!components/nls/colorPicker"
], function ($, global, colorPicker) {
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

    return function () {
        var hasPendingRendering = true,
            model = {
                r: colorPicker,
                selectedColor: null
            },
            changeHanlders = [];

        return {
            customColor: null,
            red: null,
            green: null,
            blue: null,
            pagebeforecreate: function () {
                var that = this,
                    colorChangeHandler = function () {
                        that.customColor
                            .removeClass(SELECTED_CLASS)
                            .css("background-color",
                                hexFromRgb(
                                    that.red.val(),
                                    that.green.val(),
                                    that.blue.val()));
                    };
                
                this.render(this, model);
                this.red.change(colorChangeHandler);
                this.green.change(colorChangeHandler);
                this.blue.change(colorChangeHandler).change();
            },
            pagebeforeshow: function () {
                if (hasPendingRendering) {
                    this.render("cpPredefinedColors", model);
                    hasPendingRendering = false;
                }
            },
            colors: function (colors) {
                if (colors) {
                    model.colors = colors;
                    hasPendingRendering = true;
                }
                return model.colors;
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
                    this.customColor.removeClass(SELECTED_CLASS);
                } else {
                    rgb = rgbFromHex(color);
                    this.red.val(rgb.r).slider("refresh");
                    this.green.val(rgb.g).slider("refresh");
                    this.blue.val(rgb.b).slider("refresh").change();
                    this.customColor.addClass(SELECTED_CLASS);
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
            value: function (req) {
                var color;

                if (req) {
                    color = req.get("color");
                    if (color === "custom") {
                        color = hexFromRgb(this.red.val(),
                            this.green.val(), this.blue.val());
                        this.customColor.addClass(SELECTED_CLASS);
                    } else {
                        this.customColor.removeClass(SELECTED_CLASS);
                    }
                    model.selectedColor = color;
                    this.render("cpPredefinedColors", model);
                    this.change();
                }
                return model.selectedColor;
            }
        };
    };
});
