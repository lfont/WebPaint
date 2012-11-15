/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'collections/colors',
    'views/colorPicker',
    'text!/templates/new.html',
    'i18n!views/nls/new'
], function ($, mobile, Backbone, _, colorsCollection, ColorPickerView,
             newTemplate, newResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },

        template: _.template(newTemplate),

        render: function () {
            var _this = this;

            this.$el.html(this.template({
                        r: newResources
                    }))
                    .attr('data-url', 'new')
                    .attr('data-role', 'dialog')
                    .page();

            this.backgroundColorPicker = new ColorPickerView({
                el: this.$el.find('.color-picker'),
                colors: colorsCollection
            }).render();

            this.backgroundColorPicker.on('color', function (hex) {
                _this.options.drawer.newDrawing(hex);
                _this.$el.dialog('close');
            });

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        }
    });
});
