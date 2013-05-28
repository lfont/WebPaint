/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/partial/social-widgets.html'
], function (require, socialWidgetsTemplate) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone');

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
