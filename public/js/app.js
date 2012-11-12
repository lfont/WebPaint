/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        "i18n": "lib/requirejs/i18n",
        "domReady": "lib/requirejs/domReady",
        "text": "lib/requirejs/text",
        "jquery": "http://code.jquery.com/jquery-1.8.2.min",
        "underscore": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min",
        "backbone": "http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min",
        "socket.io": "lib/socket.io/socket.io.min",
        "lib/jquery.mobile": "http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min",
        "lib/jquery.mobile.download": "lib/jquery.mobile/jquery.mobile.download",
        "lib/jquery.mobile.toast": "lib/jquery.mobile/jquery.mobile.toast",
        "drawing": "lib/drawing/drawing-0.6.1",
        "lib/drawing.event": "lib/drawing/drawing.event.jquery-0.6.1"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: [ "underscore", "jquery" ],
            exports: "Backbone"
        },
        "socket.io": {
            exports: "io"
        },
        "drawing": {
            exports: "drawing"
        },
        "lib/drawing.event": {
            deps: [ "drawing", "jquery" ],
            exports: "drawing.canvasDrawer.fn.eventShapeDrawer"
        }
    }
});

define([
    "jquery",
    "models/settings"
], function ($, settingsModel) {
    "use strict";

    var locale;

    console.log("Loading...");

    // Set the UI language if it is defined by the user.
    locale = settingsModel.get("locale");
    if (locale) {
        require.config({
            config: {
                i18n: {
                    locale: locale
                }
            }
        });
    }

    require([
        "views/main"
    ], function (Main) {
        $(function () {
            var main = new Main({ el: $("#main") });

            $(window).unload(function () {
                console.log("Unloading...");
                main.unload();
                settingsModel.save();
            });

            // jQuery Mobile must be loaded after the application code.
            require([
                "lib/jquery.mobile",
                "lib/jquery.mobile.download",
                "lib/jquery.mobile.toast"
            ], function () {
                $("#appLoadingMessage").hide();
            });
        });
    });
});
