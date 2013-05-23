/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/partial/social-widgets.html'
], function ($, Backbone, _, socialWidgetsTemplate) {
    'use strict';

    var SocialWidgetsView = Backbone.View.extend({
        className: 'social-widgets',
        template: _.template(socialWidgetsTemplate),

        render: function () {
            this.$el
                .html(this.template());
            return this;
        }
    });
    
    return SocialWidgetsView;
});
