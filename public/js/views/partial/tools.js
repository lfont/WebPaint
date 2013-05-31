/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'views/partial/color-picker',
    'text!templates/partial/tools.html',
    'i18n!nls/tools-view'
], function (require, ColorPickerView, toolsTemplate, toolsResources) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone'),
        drawing  = require('drawing');

    return Backbone.View.extend({
        attributes: {
            id: 'tools-view'
        },
        
        className: 'tools-view',
        
        template: _.template(toolsTemplate),

        initialize: function () {
            this._drawerManager = this.options.drawerManager;
            
            this._views = {};
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: toolsResources,
                    shapes: drawing.shapes
                }));

            this._views.shapeColorPicker = new ColorPickerView({
                collection: this.model.colors
            }).render();

            this._views
                .shapeColorPicker
                .$el
                .appendTo(this.$el.find('.color-picker-anchor'));
            
            this.listenTo(this._views.shapeColorPicker, 'color',
                          this._drawerManager.color.bind(this._drawerManager));
            
            this._$shapes = this.$el.find('.shape');
            this._$width = this.$el.find('.width');

            return this;
        },

        refresh: function () {
            this._$shapes.filter('[value="' + this._drawerManager.shape() + '"]')
                         .attr('checked', true)
                         .end()
                         .checkboxradio('refresh');

            this._$width.val(this._drawerManager.lineWidth())
                        .slider('refresh');

            this._views.shapeColorPicker.value(this._drawerManager.color());
        },

        store: function () {
            var $shape = this._$shapes.filter(':checked');

            this._drawerManager.shape($shape.val());
            this._drawerManager.lineWidth(parseInt(this._$width.val(), 10));
        }
    });
});
