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
        
        initialize: function () {
            this._app = this.options.app;
            
            this._views = {};
            this._environment = this._app.environment;
        },

        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                    r: aboutResources,
                    name: this._environment.get('appName'),
                    version: this._environment.get('appVersion')
                }))
                .attr('id', 'about-view')
                .attr('data-position-to', 'window')
                .addClass('about-view')
                .addClass('ui-corner-all')
                .trigger('create')
                .popup();

            if (this._environment.get('screenSize') === 'small') {
                require([
                    'views/partial/social-widgets'
                ], function (SocialWidgetsView) {
                    _this._views.socialWidgets = new SocialWidgetsView().render();
                    _this._views.socialWidgets
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
