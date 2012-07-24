/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global"
], function (global) {
    var data,
        model = {},
        translate = function (m) {
            m.title = global.l("%options.title");
            m.options = [
                {
                    link: "#newDrawing",
                    name: global.l("%options.new")
                },
                {
                    method: {
                        name: "callAction",
                        param: "saveAs"
                    },
                    name: global.l("%options.saveAs")
                },
                {
                    method: {
                        name: "callAction",
                        param: "clear"
                    },
                    name: global.l("%options.clear")
                },
                {
                    link: "#history",
                    name: global.l("%options.history")
                },
                {
                    link: "#language",
                    name: global.l("%options.language")
                },
                {
                    link: "#about",
                    name: global.l("%options.about")
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
            global.goBackTo("#main");
        }
    };
});
