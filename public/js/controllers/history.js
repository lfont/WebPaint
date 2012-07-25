/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "i18n!controllers/nls/history"
], function (global, history) {
    var actions,
        model = {
            r: history
        };

    return {
        pagebeforecreate: function () {
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
