/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'text!templates/quick-action.html'
], function (require, $, Backbone, _, quickActionTemplate) {
    'use strict';

    var QuickActionView = Backbone.View.extend({
        events: {
            'vclick': 'actionClick'
        },

        tagName: 'a',
        className: 'quick-action',
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
