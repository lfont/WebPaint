/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/social-widgets.html'
], function ($, Backbone, _, socialWidgetsTemplate) {
    'use strict';

    return Backbone.View.extend({
        template: _.template(socialWidgetsTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});
