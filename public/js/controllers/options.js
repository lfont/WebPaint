define([
   "context"
], function (context) {
    var data,
        model = {},
        translate = function (m) {
            m.title = context.l("%options.title");
            m.options = [
                {
                    link: "#newDrawing",
                    name: context.l("%options.new")
                },
                {
                    method: {
                        name: "callAction",
                        param: "saveAs"
                    },
                    name: context.l("%options.saveAs")
                },
                {
                    method: {
                        name: "callAction",
                        param: "clear"
                    },
                    name: context.l("%options.clear")
                },
                {
                    link: "#history",
                    name: context.l("%options.history")
                },
                {
                    link: "#language",
                    name: context.l("%options.language")
                },
                {
                    link: "#about",
                    name: context.l("%options.about")
                }
            ];
        };

    return {
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
        },
        pagebeforeshow: function (req) {
            if (req.get("actions")) {
                // the previous page was "#main"
                data = req.get();
            }
        },
        pagebeforehide: function (req, res) {
            res.send(data);
        },
        callAction: function (req) {
            data.actions[req.get("name")]();
            context.goBackTo("#main");
        }
    };
});
