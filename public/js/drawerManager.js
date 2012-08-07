/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "backbone",
   "underscore",
   "lib/drawing",
   "models/settings",
   "views/tools",
   "views/options",
   "i18n!nls/drawerManager",
   "lib/drawing.event"
], function ($, Backbone, _, drawing, settingsModel, toolsView,
             optionsView, drawerManagerResources) {
    "use strict";

    return function (canvas) {
        var drawer = drawing.canvasDrawer(canvas),
            shapeDrawer = drawer.eventShapeDrawer({
                events: {
                    down: "vmousedown",
                    up: "vmouseup",
                    move: "vmousemove"
                }
            }),
            
            initialize = function () {
                drawer.newDrawing(settingsModel.get("background"));
                drawer.properties({
                    lineWidth: settingsModel.get("lineWidth"),
                    strokeStyle: settingsModel.get("strokeStyle"),
                    fillStyle: settingsModel.get("fillStyle"),
                    lineCap: settingsModel.get("lineCap")
                });

                if (settingsModel.has("histories")) {
                    drawer.histories(settingsModel.get("histories"));
                    drawer.history(settingsModel.get("history"));
                }
            };

        this.undo = function () {
            if (!drawer.undo()) {
                $.mobile.showToast(drawerManagerResources.lastUndo);
            }

            return this;
        };

        this.redo = function () {
            if (!drawer.redo()) {
                $.mobile.showToast(drawerManagerResources.lastRedo);
            }

            return this;
        };

        this.on = function () {
            window.setTimeout(function () {
                shapeDrawer.on(settingsModel.get("shape"));
            }, 250);

            return this;
        };

        this.off = function () {
            settingsModel.set({
                histories: drawer.histories(),
                history: drawer.history()
            });

            shapeDrawer.off();

            return this;
        };

        this.unload = function () {
            var histories = drawer.histories(),
                history = drawer.history();

            settingsModel.set({
                histories: (histories.length > 10) ?
                    histories.slice(histories.length - 10) :
                    histories,
                history: (history >= histories.length) ?
                    histories.length - 1 :
                    history
            });

            return this;
        };

        toolsView.on("color", function (name) {
            var properties = {
                strokeStyle: name,
                fillStyle: name
            };
            settingsModel.set(properties);
            drawer.properties(properties);
        });

        toolsView.on("lineWidth", function (width) {
            var properties = {
                lineWidth: width
            };
            settingsModel.set(properties);
            drawer.properties(properties);
        });

        optionsView.on("newDrawing", function (color) {
            settingsModel.set({
                background: color,
                shape: "pencil"
            });
            drawer.newDrawing(color);
        });

        optionsView.on("clear", function () {
            drawer.clear().store();
        });

        optionsView.on("history", function (index) {
            drawer.history(index);
        });

        optionsView.on("save", function () {
            $.mobile.download(
                "/service/saveAs/drawing.png",
                "POST",
                {
                    dataURL: drawer.histories()[drawer.history()]
                });
        });

        initialize();
    };
});
