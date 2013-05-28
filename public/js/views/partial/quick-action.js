/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/partial/quick-action.html'
], function (require, quickActionTemplate) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone');

    var QuickActionView = Backbone.View.extend({
        className: 'quick-action',
        
        events: {
            'vclick': 'actionClick'
        },

        tagName: 'a',
        
        template: _.template(quickActionTemplate),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        actionClick: function (event) {
            event.preventDefault();
            this.trigger('selected', this.model);
        }
    });

    return QuickActionView;
});
