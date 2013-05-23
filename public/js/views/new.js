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

        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                r: newResources
            }))
            .attr('id', 'new-view')
            .attr('data-role', 'dialog');

            this.backgroundColorPicker = new ColorPickerView({
                collection: this.options.environment.get('colors')
            }).render();

            this.backgroundColorPicker.$el
                                      .appendTo(this.$el.find('.color-picker-anchor'));

            this.backgroundColorPicker.on('color', function (hex) {
                _this.options.drawerManager.newDrawing(hex);
                _this.$el.dialog('close');
            });

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
