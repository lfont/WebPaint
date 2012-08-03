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
        };

    return {
        initialize: function () {
            this.on({
                historicChange: function (sender, historic) {
                    model.histories = historic.items;
                    model.history = historic.index;
                }
            });
        },
        pagebeforecreate: function () {
            this.render(historyTemplate, model);
        },
        pagebeforeshow: function () {
            this.render(
                    historyListTemplate,
                    this.find(".historyListAnchor"),
                    model)
                .trigger("create");
        },
        setHistory: function (context) {
            var index = context.get("index");
            this.emit("history", parseInt(index, 10));
            global.goBackTo("main");
        }
    };
});
