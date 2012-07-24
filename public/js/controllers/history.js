/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global"
], function (global) {
    var actions,
        model = {},
        translate = function (m) {
            m.title = global.l("%history.title");
            m.historyLabel = global.l("%history.historyLabel");
        };

    return {
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
        },
        pagebeforeshow: function (req) {
            var drawer = req.get("drawer");

            actions = req.get("actions");
            model.histories = drawer.histories;
            model.history = drawer.history;
            this.render("pagebeforeshow", model).trigger("create");
        },
        setHistory: function (req) {
            actions.setHistory(parseInt(req.get("index"), 10));
            global.goBackTo("#main");
        }
    };
});
