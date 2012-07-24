/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "drawing",
   "global",
   "settings",
   "lib/drawing.event"
], function ($, drawing, global, settings) {
    "use strict";

    var drawer,
        eventShapeDrawer,
        model = {},
        appSettings,
        translate = function (m) {
            m.title = global.l("%main.title");
            m.undoButton = global.l("%main.undoButton");
            m.redoButton = global.l("%main.redoButton");
            m.toolsButton = global.l("%main.toolsButton");
            m.optionsButton = global.l("%main.optionsButton");
            m.lastUndo = global.l("%main.lastUndo");
            m.lastRedo = global.l("%main.lastRedo");

            $.mobile.page.prototype.options.backBtnText = global.l("%backButton");
        },
        // geometry
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
        // actions
        actions = {
            clear: function () {
                drawer.clear().store();
            },
            newDrawing: function (backgroundColor) {
                appSettings.drawer.backgroundColor = backgroundColor;
                drawer.newDrawing(backgroundColor);
                this.setShape("pencil");
            },
            saveAs: function () {
                $.mobile.download("/service/saveAs/drawing.png", "POST", {
                    dataURL: drawer.histories()[drawer.history()]
                });
            },
            setLineWidth: function (width) {
                drawer.properties({
                    lineWidth: width
                });
            },
            setColor: function (color) {
                drawer.properties({
                    strokeStyle: color,
                    fillStyle: color
                });
            },
            setHistory: function (index) {
                drawer.history(index);
            },
            setShape: function (shapeName) {
                appSettings.drawer.shape = shapeName;
            },
            setLocale: function (locale) {
                appSettings.locale = locale;
                window.location.reload();
            }
        };

    return {
        header: null,
        content: null,
        canvas: null,
        pagebeforecreate: function () {
            appSettings = settings.get();
            if (appSettings.locale) {
                String.locale = appSettings.locale;
            }

            translate(model);
            this.render("pagebeforecreate", model);
        },
        pageshow: function () {
            if (!drawer) {
                fixContentGeometry(this.header, this.content);
                fixCanvasGeometry(this.content, this.canvas);
                
                drawer = drawing.canvasDrawer(this.canvas[0]);
                eventShapeDrawer = drawer.eventShapeDrawer({
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
                    actions.setHistory(appSettings.drawer.history);
                    actions.setShape(appSettings.drawer.shape);
                } else {
                    actions.newDrawing();
                }
            }

            setTimeout(function () {
                eventShapeDrawer.on(appSettings.drawer.shape);
            }, 500);
        },
        pagebeforehide: function (req, res) {
            res.send("actions", actions);
            res.send("locale", appSettings.locale);
            res.send("drawer", {
                properties: drawer.properties(),
                histories: drawer.histories(),
                history: drawer.history(),
                shape: appSettings.drawer.shape
            });
            eventShapeDrawer.off();
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
        },
        undo: function (req) {
            req.event.preventDefault();
            if (!drawer.undo()) {
                $.mobile.showToast(model.lastUndo);
            }
        },
        redo: function (req) {
            req.event.preventDefault();
            if (!drawer.redo()) {
                $.mobile.showToast(model.lastRedo);
            }
        }
    };
});
