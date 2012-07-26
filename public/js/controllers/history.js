/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "text!templates/history.html",
    "text!templates/historyList.html",
    "i18n!controllers/nls/history"
], function (global, historyTemplate, historyListTemplate, historyResources) {
    "use strict";

    var model = {
            r: historyResources
        },

        messageHandlers = {
            history: function (history) {
                model.histories = history.items;
                model.history = history.index;
            }
        };

    return {
        pagebeforecreate: function () {
            this.render(historyTemplate, model);
        },
        pagebeforeshow: function () {
            this.render(
                    historyListTemplate,
                    this.$el.find(".historyListAnchor"),
                    model)
                .trigger("create");
        },
        setHistory: function (context) {
            var index = context.get("index");

            this.send("main", "history", parseInt(index, 10));
            global.goBackTo("main");
        },
        onMessage: function (message, data) {
            messageHandlers[message.name](data);
        }
    };
});
