define([
    "context"
], function (context) {
    var actions,
        model = {},
        translate = function (m) {
            m.title = context.l("%history.title");
            m.historyLabel = context.l("%history.historyLabel");
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
            context.goBackTo("#main");
        }
    };
});
