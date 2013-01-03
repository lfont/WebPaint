/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'jquery.mobile',
    'backbone',
    'underscore',
    'text!templates/open.html',
    'i18n!nls/open-view'
], function ($, mobile, Backbone, _, openTemplate, openResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose',
            'vclick .cancel': 'cancel',
            'change .path': 'open'
        },

        template: _.template(openTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: openResources
                    }))
                    .addClass('ui-corner-all')
                    .attr('data-position-to', 'window')
                    .trigger('create')
                    .popup();

            return this;
        },

        show: function () {
            this.$el.find('.path')
                    .val('')
                    .end()
                    .popup('open');
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        popupafterclose: function () {
            this.trigger('close');
        },

        cancel: function (event) {
            event.preventDefault();
            this.$el.popup('close');
        },

        open: function (event) {
            var _this = this,
                files = event.target.files,
                file, reader;

            event.preventDefault();

            if (files.length === 0) {
                return;
            }

            file = files[0];

            if (!file.type.match(/image.*/)) {
                return;
            }

            reader = new FileReader();

            reader.onload = function(e) {
                var image = new window.Image();
                image.onload = function () {
                    _this.options.drawer.newDrawing(image);
                };
                image.src = e.target.result;
            };

            // TODO: add a progress bar.
            reader.readAsDataURL(file);

            window.setTimeout(function () {
                _this.$el.popup('close');
            }, 250);
        }
    });
});
