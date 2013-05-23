/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'text!templates/about.html',
    'i18n!nls/about-view'
], function (require, $, Backbone, _, aboutTemplate, aboutResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose'
        },

        template: _.template(aboutTemplate),

        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                    r: aboutResources,
                    name: this.options.environment.get('appName'),
                    version: this.options.environment.get('appVersion')
                }))
                .attr('id', 'about-view')
                .attr('data-position-to', 'window')
                .addClass('about-view')
                .addClass('ui-corner-all')
                .trigger('create')
                .popup();

            if (this.options.environment.get('screenSize') === 'small') {
                require([
                    'views/partial/social-widgets'
                ], function (SocialWidgetsView) {
                    var socialWidgetsView = new SocialWidgetsView();
                    socialWidgetsView.render()
                                     .$el
                                     .appendTo(_this.$el.find('.social-widgets-anchor'));
                });
            }

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
