/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'text!/templates/about.html',
    'i18n!nls/about-view'
], function ($, mobile, Backbone, _, aboutTemplate, aboutResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose'
        },

        template: _.template(aboutTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: aboutResources,
                        name: this.options.environment.get('appName'),
                        version: this.options.environment.get('appVersion')
                    }))
                    .addClass('ui-corner-all')
                    .attr('data-position-to', 'window')
                    .trigger('create')
                    .popup();

            return this;
        },

        show: function () {
            this.$el.popup('open');
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        popupafterclose: function () {
            this.trigger('close');
        }
    });
});
