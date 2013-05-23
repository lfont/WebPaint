/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'views/partial/history-item',
    'text!templates/history.html',
    'i18n!nls/history-view'
], function ($, Backbone, _, HistoryItemView, historyTemplate, historyResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },

        template: _.template(historyTemplate),

        render: function () {
            this.$el.html(this.template({
                r: historyResources
            }))
            .attr('id', 'history-view')
            .attr('data-role', 'dialog')
            .page();

            this.$historyList = this.$el.find('[data-role="listview"]');

            this.snapshots = this.options.environment.get('snapshots');
            this.listenTo(this.snapshots, 'set', this.setSnapshots);
            this.setSnapshots(this.snapshots.value);

            return this;
        },

        show: function () {
            $.mobile.navigate('#history-view');
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        setSnapshot: function (snapshot) {
            this.options.drawerManager.cursor(snapshot.index);
            this.$el.dialog('close');
        },

        setSnapshots: function (imageDataURLs) {
            _.each(imageDataURLs, function (imageDataURL, index) {
                var historyItemView = new HistoryItemView({
                    environment: this.options.environment,
                    model: {
                        index: index,
                        imageDataURL: imageDataURL
                    }
                });

                historyItemView.on('selected', this.setSnapshot, this);
                this.snapshots.once('set', historyItemView.remove, historyItemView);
                historyItemView.render().$el.prependTo(this.$historyList);
            }, this);

            this.$historyList.listview('refresh');
        }
    });
});
