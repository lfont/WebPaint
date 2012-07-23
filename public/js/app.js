/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        jquery: "http://code.jquery.com/jquery-1.7.1.min",
        "lib/jquery.mobile": "http://code.jquery.com/mobile/1.1.1/jquery.mobile-1.1.1.min",
        "lib/jquery.mobile.mvc": "lib/jquery.mobile.mvc-0.6.1",
        "drawing": "lib/drawing-0.6.1",
        "lib/drawing.event": "lib/drawing.event.jquery-0.6.1"
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
    "lib/jquery.mobile.mvc",
    "components/colorPicker",
    "controllers/main",
    "controllers/newDrawing",
    "controllers/options",
    "controllers/tools",
    "controllers/history",
    "controllers/language",
    "controllers/about"
], function ($, mvc, colorPickerComponent, mainController,
             newDrawingController, optionsController, toolsController,
             historyController, languageController, aboutController) {
    "use strict";

    var webPaint = mvc.application();

    $.extend(mvc.components, {
        colorPicker: colorPickerComponent
    });

    $(document).on("mobileinit", function () {
        $.mobile.defaultPageTransition = "none";
        $.mobile.defaultDialogTransition = "none";
        $.mobile.page.prototype.options.addBackBtn = true;
    });

    webPaint.controller("#main", mainController);
    webPaint.controller("#newDrawing", newDrawingController);
    webPaint.controller("#options", optionsController);
    webPaint.controller("#tools", toolsController);
    webPaint.controller("#history", historyController);
    webPaint.controller("#language", languageController);
    webPaint.controller("#about", aboutController);

    webPaint.start(function () {
        require([
            "lib/jquery.mobile",
            "lib/jquery.mobile.download",
            "lib/jquery.mobile.toast"
        ]);
    });

    webPaint.stop(function () {
        this.controller("#main").unload();
    });
});
