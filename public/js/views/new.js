/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'views/partial/color-picker',
    'text!templates/new.html',
    'i18n!nls/new-view'
], function ($, Backbone, _, ColorPickerView, newTemplate, newResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },

        template: _.template(newTemplate),

        initialize: function () {
            this._app = this.options.app;
            
            this._views = {};
            this._environment = this._app.environment;
            this._drawerManager = this._app.drawerManager;
        },
        
        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                r: newResources
            }))
            .attr('id', 'new-view')
            .attr('data-role', 'dialog');

            this._views.backgroundColorPicker = new ColorPickerView({
                collection: this._environment.get('colors')
            })
            .on('color', function (hex) {
                _this._drawerManager.newDrawing(hex);
                _this.$el.dialog('close');
            })
            .render();
            this._views.backgroundColorPicker.$el
                                             .appendTo(this.$el.find('.color-picker-anchor'));

            this.$el.page();

            return this;
        },

        show: function () {
            $.mobile.navigate('#new-view');
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        }
    });
});
