/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'drawing',
    'views/partial/color-picker',
    'text!templates/partial/tools.html',
    'i18n!nls/tools-view'
], function ($, Backbone, _, drawing, ColorPickerView, toolsTemplate,
             toolsResources) {
    'use strict';

    return Backbone.View.extend({
        template: _.template(toolsTemplate),

        initialize: function () {
            this._drawerManager = this.options.drawerManager;
        },
        
        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                    r: toolsResources,
                    shapes: drawing.shapes
                }))
                .attr('id', 'tools-view')
                .addClass('tools-view');

            this.shapeColorPicker = new ColorPickerView({
                collection: this.model.colors
            }).render();

            this.shapeColorPicker.$el
                                 .appendTo(this.$el.find('.color-picker-anchor'));
            
            this.shapeColorPicker.on('color', function (hex) {
                _this._drawerManager.color(hex);
            });

            return this;
        },

        refresh: function () {
            var $shapes = this.$el.find('.shape'),
                $width = this.$el.find('.width');

            $shapes.filter('[value="' + this._drawerManager.shape() + '"]')
                   .attr('checked', true)
                   .end()
                   .checkboxradio('refresh');

            $width.val(this._drawerManager.lineWidth())
                  .slider('refresh');

            this.shapeColorPicker.value(this._drawerManager.color());
        },

        store: function () {
            var $shape = this.$el.find('.shape:checked'),
                $width = this.$el.find('.width');

            this._drawerManager.shape($shape.val());
            this._drawerManager.lineWidth(parseInt($width.val(), 10));
        }
    });
});
