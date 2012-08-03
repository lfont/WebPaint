/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        "i18n": "lib/requirejs/i18n",
        "text": "lib/requirejs/text",
        "jquery": "http://code.jquery.com/jquery-1.7.1.min",
        "lib/jquery.mobile": "http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min",
        "lib/jquery.mobile.download": "lib/jquery.mobile/jquery.mobile.download",
        "lib/jquery.mobile.toast": "lib/jquery.mobile/jquery.mobile.toast",
        "lib/coreMVC": "lib/coreMVC-0.7.0",
        "lib/drawing": "lib/drawing/drawing-0.6.1",
        "lib/drawing.event": "lib/drawing/drawing.event.jquery-0.6.1"
    },
    shim: {
        "lib/coreMVC": {
            deps: [ "jquery" ],
            exports: "coreMVC"
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

    locale = settingsModel.get("locale");

    $(document).on("mobileinit", function () {
        $.mobile.defaultPageTransition = "none";
        $.mobile.defaultDialogTransition = "none";
    });

    settingsModel.on("change:locale", function () {
        window.location.reload();
    });

    // Set the UI language if it is defined by the user.
    if (locale) {
        require.config({
            config: {
                i18n: {
                    locale: locale
                }
            }
        });
    }

    // Loads app code
    require([
        "controllers/main",
        "controllers/newDrawing",
        "controllers/options",
        "controllers/tools",
        "controllers/history",
        "controllers/language",
        "controllers/about"
    ], function (Main, NewDrawing, Options, Tools, History, Language, About) {
        var main, newDrawing, options, tools, history, language, about;

        $(function () {
            main = new Main("#main");
            newDrawing = new NewDrawing("#newDrawing");
            options = new Options("#options");
            tools = new Tools("#tools");
            history = new History("#history");
            language = new Language("#language");
            about = new About("#about");
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
