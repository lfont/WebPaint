/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "global",
    "text!templates/about.html",
    "i18n!views/nls/about"
], function ($, Backbone, _, global, aboutTemplate, aboutResources) {
    "use strict";

    var info = global.getInfo();

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pagebeforeshow": "pagebeforeshow",
            "pagehide": "pagehide"
        },

        template: _.template(aboutTemplate),

        render: function () {
            this.$el.html(this.template({
                r: aboutResources,
                name: info.name,
                version: info.version
            }));

            return this;
        },

        pagebeforecreate: function () {
            this.render();
        },

        pagebeforeshow: function () {
            this.trigger("open");
        },

        pagehide: function () {
            this.trigger("close");
        }
    });
});
