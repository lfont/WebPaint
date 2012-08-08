/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        "i18n": "lib/requirejs/i18n",
        "text": "lib/requirejs/text",
        "jquery": "http://code.jquery.com/jquery-1.7.2.min",
        "underscore": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min",
        "backbone": "http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min",
        "lib/jquery.mobile": "http://code.jquery.com/mobile/1.2.0-alpha.1/jquery.mobile-1.2.0-alpha.1.min",
        "lib/jquery.mobile.download": "lib/jquery.mobile/jquery.mobile.download",
        "lib/jquery.mobile.toast": "lib/jquery.mobile/jquery.mobile.toast",
        "lib/drawing": "lib/drawing/drawing-0.6.1",
        "lib/drawing.event": "lib/drawing/drawing.event.jquery-0.6.1"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        "lib/jquery.mobile": {
            deps: [ "jquery" ],
            exports: "jQuery.mobile"
        },
        "lib/jquery.mobile.download": {
            deps: [ "lib/jquery.mobile" ],
            exports: "jQuery.mobile.download"
        },
        "lib/jquery.mobile.toast": {
            deps: [ "lib/jquery.mobile" ],
            exports: "jQuery.mobile.toast"
        },
        "lib/drawing": {
            exports: "drawing"
        },
        "lib/drawing.event": {
            deps: [ "lib/drawing", "jquery" ],
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

    console.log("Loading WebPaint...");

    $(document).on("mobileinit", function () {
        $.mobile.defaultPageTransition = "none";
        $.mobile.defaultDialogTransition = "none";
    });

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

    $(function () {
        require([
            "views/main"
        ], function (main) {
            $(window).unload(function () {
                console.log("Unloading WebPaint...");
                main.unload();
                settingsModel.save();
            });

            // jQuery.mobile must be loaded after the application code.
            require([
                "lib/jquery.mobile",
                "lib/jquery.mobile.download",
                "lib/jquery.mobile.toast"
            ], function () {
                console.log("WebPaint is ready.");
            });
        });
    });
});
