/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'views/quick-action'
], function (require, $, Backbone, _, QuickActionView) {
    'use strict';

    var QuickActionGroupView = Backbone.View.extend({
        tagName: 'li',
        className: 'quick-action-group',

        render: function () {
            var hasMultipleActions = this.collection.length > 1;

            _.each(this.collection, function (action) {
                var quickActionView = new QuickActionView({
                    model: action
                });

                quickActionView.on('selected', function (action) {
                    this.trigger('selected', action);
                }, this);

                quickActionView.render().$el.appendTo(this.$el);
            }, this);

            if (hasMultipleActions) {
                this.$el.data('role', 'list-divider');
            }

            return this;
        }
    });

    return QuickActionGroupView;
});
