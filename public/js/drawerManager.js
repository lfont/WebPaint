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
   "i18n!nls/drawerManager",
   "lib/drawing.event"
], function ($, Backbone, _, drawing, settingsModel, drawerManagerResources) {
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
                var histories = settingsModel.get("histories");

                drawer.newDrawing(settingsModel.get("background"));
                drawer.properties({
                    lineWidth: settingsModel.get("lineWidth"),
                    strokeStyle: settingsModel.get("strokeStyle"),
                    fillStyle: settingsModel.get("fillStyle"),
                    lineCap: settingsModel.get("lineCap")
                });

                if (histories.length > 0) {
                    drawer.histories(histories);
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

        this.setShape = function (name) {
            settingsModel.set({
                shape: name
            });
        };

        this.setColor = function (hex) {
            var properties = {
                strokeStyle: hex,
                fillStyle: hex
            };
            settingsModel.set(properties);
            drawer.properties(properties);
        };

        this.setLineWidth = function (value) {
            var properties = {
                lineWidth: value
            };
            settingsModel.set(properties);
            drawer.properties(properties);
        };

        this.setHistory = function (value) {
            drawer.history(value);
        };

        this.newDrawing = function (hex) {
            settingsModel.set({
                background: hex,
                shape: "pencil"
            });
            drawer.newDrawing(hex);
        };

        this.clear = function () {
            drawer.clear().store();
        };

        this.save = function () {
            $.mobile.download(
                "/service/saveAs/drawing.png",
                "POST",
                {
                    dataURL: drawer.histories()[drawer.history()]
                });
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

        initialize();
    };
});
