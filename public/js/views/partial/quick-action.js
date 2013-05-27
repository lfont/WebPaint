/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'text!templates/partial/quick-action.html'
], function (require, $, Backbone, _, quickActionTemplate) {
    'use strict';

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
