/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'drawing',
    'views/color-picker',
    'text!templates/tools.html',
    'i18n!nls/tools-view'
], function ($, Backbone, _, drawing, ColorPickerView, toolsTemplate,
             toolsResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose'
        },

        template: _.template(toolsTemplate),

        initialize: function () {
            var notDefined;
            this.isPopup = this.options.positionTo !== notDefined &&
                           this.options.positionTo !== null;
        },

        render: function () {
            var _this = this;

            this.$el.html(this.template({
                        r: toolsResources,
                        shapes: drawing.shapes
                    }))
                    .attr('id', 'tools')
                    .addClass('tools-view');

            if (this.isPopup) {
                this.$el.trigger('create')
                        .popup();
            } else {
                this.$el.attr('data-role', 'dialog')
                        .page();
            }

            this.shapeColorPicker = new ColorPickerView({
                el: this.$el.find('.color-picker'),
                colors: this.options.environment.get('colors')
                                                .getDrawableColors()
            }).render();

            this.shapeColorPicker.on('color', function (hex) {
                _this.options.drawer.color(hex);
            });

            return this;
        },

        show: function () {
            if (this.isPopup) {
                this.$el.popup('open', {
                    positionTo: this.options.positionTo
                });
            } else {
                $.mobile.navigate('#tools');
            }
        },

        pagebeforeshow: function () {
            var $shapes = this.$el.find('.shape'),
                $width = this.$el.find('.width');

            $shapes.filter('[value="' + this.options.drawer.shape() + '"]')
                   .attr('checked', true)
                   .end()
                   .checkboxradio('refresh');

            $width.val(this.options.drawer.lineWidth())
                  .slider('refresh');

            this.shapeColorPicker.value(this.options.drawer.color());
            this.trigger('open');
        },

        pagehide: function () {
            var $shape = this.$el.find('.shape:checked'),
                $width = this.$el.find('.width');

            this.options.drawer.shape($shape.val());
            this.options.drawer.lineWidth(parseInt($width.val(), 10));
            this.trigger('close');
        },

        popupbeforeposition: function () {
            this.pagebeforeshow();
        },

        popupafterclose: function () {
            this.pagehide();
        }
    });
});
