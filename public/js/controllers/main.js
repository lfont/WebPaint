/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "lib/drawing",
   "global",
   "settings",
   "text!templates/main.html",
   "i18n!controllers/nls/main",
   "lib/drawing.event"
], function ($, drawing, global, settings, mainTemplate, mainResources) {
    "use strict";

    var info = global.getInfo(),
        model = {
            r: mainResources,
            name: info.name
        },
        drawer, shapeDrawer, appSettings,

        fixContentGeometry = function ($header, $content) {
            var contentHeight = $(window).height() - $header.outerHeight();

            contentHeight -= ($content.outerHeight() - $content.height());
            $content.height(contentHeight);
        },

        fixCanvasGeometry = function ($content, $canvas) {
            var canvas = $canvas[0];

            canvas.height = ($content.height() -
                ($canvas.outerHeight() - $canvas.height()));
            canvas.width = ($content.width() -
                ($canvas.outerWidth() - $canvas.width()));
        },

        messageHandlers = {
            clear: function () {
                drawer.clear().store();
            },
            "new": function (backgroundColor) {
                appSettings.drawer.backgroundColor = backgroundColor;
                drawer.newDrawing(backgroundColor);
                this.shape("pencil");
            },
            save: function () {
                $.mobile.download("/service/saveAs/drawing.png", "POST", {
                    dataURL: drawer.histories()[drawer.history()]
                });
            },
            lineWidth: function (width) {
                drawer.properties({
                    lineWidth: width
                });
            },
            color: function (color) {
                drawer.properties({
                    strokeStyle: color,
                    fillStyle: color
                });
            },
            history: function (index) {
                drawer.history(index);
            },
            shape: function (shapeName) {
                appSettings.drawer.shape = shapeName;
            },
            locale: function (locale) {
                appSettings.locale = locale;
                window.location.reload();
            },
            unload: function () {
                var histories = drawer.histories(),
                    history = drawer.history();

                appSettings.drawer.properties = drawer.properties();

                appSettings.drawer.histories = (histories.length > 10) ?
                    histories.slice(histories.length - 10) :
                    histories;

                appSettings.drawer.history = (history >=
                    appSettings.drawer.histories.length) ?
                    appSettings.drawer.histories.length - 1 :
                    history;

                settings.save(appSettings);
            }
        };

    return {
        pagebeforecreate: function () {
            appSettings = settings.get();
            this.render(mainTemplate, model);
        },
        pageshow: function () {
            var $header, $content, $canvas;

            if (!drawer) {
                $header = this.$el.find("[data-role='header']");
                $content = this.$el.find("[data-role='content']");
                $canvas = this.$el.find("canvas");

                fixContentGeometry($header, $content);
                fixCanvasGeometry($content, $canvas);
                
                drawer = drawing.canvasDrawer($canvas[0]);
                shapeDrawer = drawer.eventShapeDrawer({
                    events: {
                        down: "vmousedown",
                        up: "vmouseup",
                        move: "vmousemove"
                    }
                });

                if (appSettings.drawer.histories.length) {
                    drawer.newDrawing(appSettings.drawer.backgroundColor);
                    drawer.properties(appSettings.drawer.properties);
                    drawer.histories(appSettings.drawer.histories);
                    messageHandlers.history(appSettings.drawer.history);
                    messageHandlers.shape(appSettings.drawer.shape);
                } else {
                    messageHandlers["new"]();
                }
            }

            setTimeout(function () {
                shapeDrawer.on(appSettings.drawer.shape);
            }, 250);
        },
        pagebeforehide: function () {
            this.send("language", "locale", appSettings.locale);

            this.send("history", "history", {
                items: drawer.histories(),
                index: drawer.history()
            });

            this.send("tools", "shape", {
                properties: drawer.properties(),
                name: appSettings.drawer.shape
            });

            shapeDrawer.off();
        },
        undo: function (context) {
            context.event.preventDefault();
            if (!drawer.undo()) {
                $.mobile.showToast(mainResources.lastUndo);
            }
        },
        redo: function (context) {
            context.event.preventDefault();
            if (!drawer.redo()) {
                $.mobile.showToast(mainResources.lastRedo);
            }
        },
        onMessage: function (message, data) {
            if (message.name === "unload" &&
                message.source !== "application") {
                // Only the application can unload this controller.
                return;
            }

            messageHandlers[message.name](data);
        }
    };
});
