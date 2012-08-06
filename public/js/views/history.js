/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "models/settings",
    "text!templates/history.html",
    "text!templates/historyList.html",
    "i18n!views/nls/history"
], function ($, Backbone, _, settingsModel, historyTemplate,
             historyListTemplate, historyResources) {
    "use strict";

    var History = Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
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
            var that = this;

            settingsModel.on("change:history", function (index) {
                that.$el.find(".history")
                        .find(".ui-li-count")
                        .hide()
                        .end()
                        .filter("[data-value='" + index + "']")
                        .find(".ui-li-count")
                        .show();
            });

            settingsModel.on("change:histories", function (items) {
                that.$el.find(".history-list")
                        .html(that.listTemplate({
                            histories: items
                        }));
            });
        },

        pagebeforecreate: function () {
            this.render();
        },

        historySelected: function (event) {
            var $this = $(event.target),
                index = $this.attr("data-value");

            event.preventDefault();

            this.trigger("history", parseInt(index, 10));
        }
    });

    return new History({ el: $("#history")[0] });
});
