/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/pick.html',
    'i18n!nls/pick-view'
], function ($, Backbone, _, pickTemplate, pickResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose',
            'vclick .cancel': 'cancel',
            'change .path': 'open'
        },

        template: _.template(pickTemplate),

        render: function () {
            this.$el.html(this.template({
                r: pickResources
            })).attr('id', 'pick-view')
               .attr('data-position-to', 'window')
               .attr('data-dismissible', 'false')
               .addClass('ui-corner-all')
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

            reader.onload = function (e) {
                var image = new Image();
                image.onload = function () {
                    _this.options.drawerManager.newDrawing(image);
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