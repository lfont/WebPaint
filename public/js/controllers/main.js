/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "backbone",
   "underscore",
   "lib/drawing",
   "global",
   "models/settings",
   "text!templates/main.html",
   "i18n!controllers/nls/main",
   "lib/drawing.event"
], function ($, Backbone, _, drawing, global, settingsModel, mainTemplate, mainResources) {
    "use strict";

    var info = global.getInfo(),

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

        DrawerManager = function (canvas) {
            var drawer = drawing.canvasDrawer(canvas),
                shapeDrawer = drawer.eventShapeDrawer({
                    events: {
                        down: "vmousedown",
                        up: "vmouseup",
                        move: "vmousemove"
                    }
                });

            this.undo = function () {
                if (!drawer.undo()) {
                    $.mobile.showToast(mainResources.lastUndo);
                }

                return this;
            };

            this.redo = function () {
                if (!drawer.redo()) {
                    $.mobile.showToast(mainResources.lastRedo);
                }

                return this;
            };

            this.on = function () {
                drawer.history(settingsModel.get("history"));
                drawer.properties(settingsModel.get("properties"));

                window.setTimeout(function () {
                    shapeDrawer.on(settingsModel.get("shape"));
                }, 250);

                return this;
            };

            this.off = function () {
                settingsModel.set({
                    histories: drawer.histories(),
                    history: drawer.history(),
                    properties: drawer.properties()
                });

                shapeDrawer.off();

                return this;
            };

            this.unload = function () {
                var histories = drawer.histories(),
                    history = drawer.history();

                settingsModel.set({
                    properties: drawer.properties(),
                    histories: (histories.length > 10) ?
                        histories.slice(histories.length - 10) :
                        histories,
                    history: (history >= histories.length) ?
                        histories.length - 1 :
                        history
                });

                return this;
            };

            settingsModel.on("change:clear", function () {
                drawer.clear().store();
            });

            settingsModel.on("change:save", function () {
                $.mobile.download(
                    "/service/saveAs/drawing.png",
                    "POST",
                    {
                        dataURL: drawer.histories()[drawer.history()]
                    });
            });

            settingsModel.on("change:background", function (color) {
                settingsModel.set({ shape: "pencil" });
                drawer.newDrawing(color);
            });

            if (settingsModel.get("histories").length) {
                drawer.newDrawing(settingsModel.get("background"));
                drawer.properties(settingsModel.get("properties"));
                drawer.histories(settingsModel.get("histories"));
                drawer.history(settingsModel.get("history"));
            } else {
                drawer.newDrawing();
            }
        };

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": this.pagebeforecreate,
            "pageshow": this.pageshow,
            "pagebeforehide": this.pagebeforehide,
            "vclick .undo": this.undo,
            "vclick .redo": this.redo
        },

        template: _.template(mainTemplate),

        render: function () {
            this.$el.html(this.template({
                r: mainResources,
                name: info.name
            }));

            return this;
        },

        pagebeforecreate: function () {
            this.render();
        },

        pageshow: function () {
            var $header, $content, $canvas;

            if (!this.drawer) {
                $header = this.$el.find("[data-role='header']");
                $content = this.$el.find("[data-role='content']");
                $canvas = this.$el.find("canvas");

                fixContentGeometry($header, $content);
                fixCanvasGeometry($content, $canvas);
                
                this.drawer = new DrawerManager($canvas[0]);
            }

            this.drawer.on();
        },

        pagebeforehide: function () {
            this.drawer.off();
        },

        undo: function (context) {
            context.event.preventDefault();
            this.drawer.undo();
        },

        redo: function (context) {
            context.event.preventDefault();
            this.drawer.redo();
        },

        unload: function () {
            this.drawer.unload();

            return this;
        }
    });
});
