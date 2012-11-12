/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'environment',
    'text!templates/about.html',
    'i18n!views/nls/about'
], function ($, Backbone, _, environment, aboutTemplate, aboutResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforecreate': 'pagebeforecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },

        template: _.template(aboutTemplate),

        render: function () {
            var appInfo = environment.getAppInfo();
            
            this.$el.html(this.template({
                r: aboutResources,
                name: appInfo.name,
                version: appInfo.version
            }));

            return this;
        },

        pagebeforecreate: function () {
            this.render();
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        }
    });
});
