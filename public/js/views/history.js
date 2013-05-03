/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/list-wrapper.html',
    'text!templates/history.html',
    'i18n!nls/history-view'
], function ($, Backbone, _, listWrapperTemplate, historyTemplate,
             historyResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .history': 'snapshotSelected'
        },

        template: _.template(listWrapperTemplate),
        listTemplate: _.template(historyTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: historyResources
                    }))
                    .attr('id', 'history')
                    .attr('data-role', 'dialog')
                    .page();

            this.options.environment.on(
                'change:cursor', this.setSnapshot.bind(this));

            this.options.environment.on(
                'change:snapshots', this.setSnapshots.bind(this));

            return this;
        },

        show: function () {
            $.mobile.navigate('#history');
        },

        pagecreate: function () {
            this.setSnapshots()
                .setSnapshot();
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        snapshotSelected: function (event) {
            var $this = $(event.target),
                index = $this.attr('data-value');

            event.preventDefault();
            this.options.drawer.cursor(parseInt(index, 10));
            this.$el.dialog('close');
        },

        setSnapshot: function () {
            this.$el.find('.history')
                    .find('.ui-li-count')
                    .hide()
                    .end()
                    .filter('[data-value="' +
                            this.options.environment.get('cursor') + '"]')
                    .find('.ui-li-count')
                    .show();

            return this;
        },

        setSnapshots: function () {
            this.$el.find('.list-wrapper')
                    .html(this.listTemplate({
                        r: historyResources,
                        histories: this.options.environment.get('snapshots')
                    }))
                    .trigger('create');

            return this;
        }
    });
});
