/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "models/settings",
    "text!/templates/history.html",
    "text!/templates/historyList.html",
    "i18n!views/nls/history"
], function ($, Backbone, _, settingsModel, historyTemplate,
             historyListTemplate, historyResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pagecreate": "pagecreate",
            "pagebeforeshow": "pagebeforeshow",
            "pagehide": "pagehide",
            "vclick .history": "historySelected"
        },

        template: _.template(historyTemplate),

        listTemplate: _.template(historyListTemplate),

        render: function () {
            this.$el.html(this.template({
                r: historyResources
            }));

            return this;
        },

        initialize: function () {
            this.drawer = this.options.drawer;

            settingsModel.on(
                "change:history",
                _.bind(this.refreshHistory, this));

            settingsModel.on(
                "change:histories",
                _.bind(this.refreshHistories, this));
        },

        pagebeforecreate: function () {
            this.render();
        },

        pagecreate: function () {
            this.refreshHistories()
                .refreshHistory();
        },

        pagebeforeshow: function () {
            this.trigger("open");
        },

        pagehide: function () {
            this.trigger("close");
        },

        historySelected: function (event) {
            var $this = $(event.target),
                index = $this.attr("data-value");

            event.preventDefault();
            this.drawer.history(parseInt(index, 10));
            $.mobile.changePage("#main", { reverse: true });
        },

        refreshHistory: function () {
            this.$el.find(".history")
                    .find(".ui-li-count")
                    .hide()
                    .end()
                    .filter("[data-value='" + settingsModel.get("history") + "']")
                    .find(".ui-li-count")
                    .show();

            return this;
        },

        refreshHistories: function () {
            this.$el.find(".history-list")
                    .html(this.listTemplate({
                        r: historyResources,
                        histories: settingsModel.get("histories")
                    }))
                    .trigger("create");

            return this;
        }
    });
});
