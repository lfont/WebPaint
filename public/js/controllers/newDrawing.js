define([
    "context"
], function (context) {
    var actions,
        model = {},
        translate = function (m) {
            m.title = context.l("%newDrawing.title");
            m.background = context.l("%newDrawing.background");
        };

    return {
        components: [
            { name: "colorPicker", alias: "cPicker" }
        ],
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
            this.component("cPicker").change(function () {
                actions.newDrawing(this.value());
                context.goBackTo("#main");
            }).colors(context.colors());
        },
        pagebeforeshow: function (req) {
            actions = req.get("actions");
        }
    };
});
