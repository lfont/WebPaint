/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'views/partial/social-widgets',
    'text!templates/about.html',
    'i18n!nls/about-view'
], function (require, SocialWidgetsView, aboutTemplate, aboutResources) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone');

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
                this._views.socialWidgets = new SocialWidgetsView().render();
                this._views.socialWidgets
                            .$el
                            .appendTo(this.$el.find('.social-widgets-anchor'));
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
