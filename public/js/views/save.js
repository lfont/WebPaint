/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'jquery.mobile',
    'backbone',
    'underscore',
    'text!templates/save.html',
    'i18n!nls/save-view'
], function ($, mobile, Backbone, _, saveTemplate, saveResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose',
            'vclick .cancel': 'cancel',
            'vclick .save': 'save'
        },

        template: _.template(saveTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: saveResources
                    }))
                    .addClass('ui-corner-all')
                    .attr('data-position-to', 'window')
                    .trigger('create')
                    .popup();

            return this;
        },

        show: function () {
            this.$el.find('.name')
                    .val('')
                    .end()
                    .find('.data')
                    .val(this.options.drawer.snapshot())
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

        save: function (event) {
            var _this = this,
                $name = this.$el.find('.name'),
                data = this.$el.find('.data').val();

            if ($name.val() === '') {
                $name.val(saveResources.defaultFileName);
            }

            this.$el.find('form').submit();

            window.setTimeout(function () {
                if (_this.options.environment.get('openSavedPicture')) {
                    window.open(data, '_blank');
                }
                _this.$el.popup('close');
            }, 250);
        }
    });
});
