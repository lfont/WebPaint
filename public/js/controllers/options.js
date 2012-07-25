/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global",
   "i18n!controllers/nls/options"
], function (global, options) {
    var data,
        model = {
            r: options,
            options: [
                {
                    link: "#newDrawing",
                    name: options["new"]
                },
                {
                    method: {
                        name: "callAction",
                        param: "saveAs"
                    },
                    name: options.saveAs
                },
                {
                    method: {
                        name: "callAction",
                        param: "clear"
                    },
                    name: options.clear
                },
                {
                    link: "#history",
                    name: options.history
                },
                {
                    link: "#language",
                    name: options.language
                },
                {
                    link: "#about",
                    name: options.about
                }
            ]
        };

    return {
        pagebeforecreate: function () {
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
