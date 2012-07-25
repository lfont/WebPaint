/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        "i18n": "lib/requirejs/i18n",
        "jquery": "http://code.jquery.com/jquery-1.7.1.min",
        "lib/jquery.mobile": "http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min",
        "lib/jquery.mobile.download": "lib/jquery.mobile/jquery.mobile.download",
        "lib/jquery.mobile.toast": "lib/jquery.mobile/jquery.mobile.toast",
        "lib/jquery.mobile.mvc": "lib/jquery.mobile/jquery.mobile.mvc-0.6.1",
        "lib/drawing": "lib/drawing/drawing-0.6.1",
        "lib/drawing.event": "lib/drawing/drawing.event.jquery-0.6.1"
    },
    shim: {
        "lib/jquery.mobile.mvc": {
            deps: [ "jquery" ],
            exports: "jqmMvc"
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
    "lib/jquery.mobile.mvc",
    "settings"
], function ($, mvc, settings) {
    "use strict";

    var appSettings;

    console.log("Loading WebPaint...");

    $(document).on("mobileinit", function () {
        $.mobile.defaultPageTransition = "none";
        $.mobile.defaultDialogTransition = "none";
    });

    // Set the UI language if it is defined by the user.
    appSettings = settings.get();
    if (appSettings.locale) {
        require.config({
            config: {
                i18n: {
                    locale: appSettings.locale
                }
            }
        });
    }

    // Loads app code
    require([
        "components/colorPicker",
        "controllers/main",
        "controllers/newDrawing",
        "controllers/options",
        "controllers/tools",
        "controllers/history",
        "controllers/language",
        "controllers/about"
    ], function (colorPickerComponent, mainController, newDrawingController,
                 optionsController, toolsController, historyController,
                 languageController, aboutController) {
        var webPaint = mvc.application();

        $.extend(mvc.components, {
            colorPicker: colorPickerComponent
        });

        webPaint.controller("#main", mainController);
        webPaint.controller("#newDrawing", newDrawingController);
        webPaint.controller("#options", optionsController);
        webPaint.controller("#tools", toolsController);
        webPaint.controller("#history", historyController);
        webPaint.controller("#language", languageController);
        webPaint.controller("#about", aboutController);

        webPaint.stop(function () {
            console.log("Unloading WebPaint...");
            mainController.unload();
            console.log("Bye");
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
