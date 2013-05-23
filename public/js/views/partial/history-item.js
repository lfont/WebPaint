/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'text!templates/partial/history-item.html',
    'i18n!nls/history-item-view'
], function (Backbone, _, historyItemTemplate, historyItemResources) {
    'use strict';

    var HistoryItemView = Backbone.View.extend({
        events: {
            'vclick': 'snapshotClick'
        },

        tagName: 'li',
        template: _.template(historyItemTemplate),

        render: function () {
            this.$el.html(this.template({
                r: historyItemResources,
                snapshot: this.model
            }));

            this.$marker = this.$el.find('.ui-li-count');

            this.listenTo(this.options.environment, 'change:cursor',
                          this.updateMarker);

            this.updateMarker(this.options.environment,
                              this.options.environment.get('cursor'));
            
            return this;
        },

        updateMarker: function (environment, cursor) {
            if (this.model.index === cursor) {
                this.$marker.show();
            } else {
                this.$marker.hide();
            }
        },

        snapshotClick: function (event) {
            event.preventDefault();
            this.trigger('selected', this.model);
        }
    });

    return HistoryItemView;
});
