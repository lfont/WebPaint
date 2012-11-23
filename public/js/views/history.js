/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'models/settings',
    'text!/templates/list-wrapper.html',
    'text!/templates/history.html',
    'i18n!nls/history-view'
], function ($, mobile, Backbone, _, settingsModel, listWrapperTemplate,
             historyTemplate, historyResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .history': 'historySelected'
        },

        template: _.template(listWrapperTemplate),

        listTemplate: _.template(historyTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: historyResources
                    }))
                    .attr('data-url', 'history')
                    .attr('data-role', 'dialog')
                    .page();

            settingsModel.on(
                'change:history',
                _.bind(this.refreshHistory, this));

            settingsModel.on(
                'change:histories',
                _.bind(this.refreshHistories, this));

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagecreate: function () {
            this.refreshHistories()
                .refreshHistory();
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        historySelected: function (event) {
            var $this = $(event.target),
                index = $this.attr('data-value');

            event.preventDefault();
            this.options.drawer.cursor(parseInt(index, 10));
            this.$el.dialog('close');
        },

        refreshHistory: function () {
            this.$el.find('.history')
                    .find('.ui-li-count')
                    .hide()
                    .end()
                    .filter('[data-value="' + settingsModel.get('history') + '"]')
                    .find('.ui-li-count')
                    .show();

            return this;
        },

        refreshHistories: function () {
            this.$el.find('.list-wrapper')
                    .html(this.listTemplate({
                        r: historyResources,
                        histories: settingsModel.get('histories')
                    }))
                    .trigger('create');

            return this;
        }
    });
});
