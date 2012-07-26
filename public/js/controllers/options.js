/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global",
   "text!templates/options.html",
   "i18n!controllers/nls/options"
], function (global, optionsTemplate, optionsResources) {
    "use strict";

    var model = {
            r: optionsResources,
            options: [
                {
                    name: optionsResources["new"],
                    link: "#newDrawing"
                },
                {
                    name: optionsResources.saveAs,
                    message: "save"
                },
                {
                    name: optionsResources.clear,
                    message: "clear"
                },
                {
                    name: optionsResources.history,
                    link: "#history"
                },
                {
                    name: optionsResources.language,
                    link: "#language"
                },
                {
                    name: optionsResources.about,
                    link: "#about"
                }
            ]
        };

    return {
        pagebeforecreate: function () {
            this.render(optionsTemplate, model);
        },
        sendMessage: function (context) {
            this.send("main", context.get("message"));
            global.goBackTo("main");
        }
    };
});
