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
    'i18n!views/nls/about'
], function ($, mobile, Backbone, _, environment, aboutTemplate, aboutResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
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
            })).page();

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        }
    });
});
