/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'environment',
    'text!/templates/about.html',
    'i18n!nls/about-view'
], function ($, mobile, Backbone, _, environment, aboutTemplate, aboutResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose'
        },

        template: _.template(aboutTemplate),

        render: function () {
            var appInfo = environment.getAppInfo();
            
            this.$el.html(this.template({
                        r: aboutResources,
                        name: appInfo.name,
                        version: appInfo.version
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
