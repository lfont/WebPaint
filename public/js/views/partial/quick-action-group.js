/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'views/partial/quick-action'
], function (require, QuickActionView) {
    'use strict';

    var _        = require('underscore'),
        Backbone = require('backbone');
    
    var QuickActionGroupView = Backbone.View.extend({
        className: 'quick-action-group',
        
        tagName: 'li',

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
