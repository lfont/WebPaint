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
   "views/tools",
   "views/options",
   "text!templates/main.html",
   "i18n!views/nls/main",
   "lib/drawing.event"
], function ($, Backbone, _, drawing, global, settingsModel, toolsView,
             optionsView, mainTemplate, mainResources) {
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
        },

        Main = Backbone.View.extend({
            events: {
                "pagebeforecreate": "pagebeforecreate",
                "pageshow": "pageshow",
                "pagebeforehide": "pagebeforehide",
                "vclick .undo": "undo",
                "vclick .redo": "redo"
            },

            template: _.template(mainTemplate),

            render: function () {
                this.$el.html(this.template({
                    r: mainResources,
                    name: info.name
                }));

                return this;
            },

            initialize: function () {
                toolsView.on("shape", function (name) {
                    settingsModel.set({
                        shape: name
                    });
                });
                            
                optionsView.on("language", function (locale) {
                    settingsModel.set({
                        locale: locale
                    });
                        
                    window.location.reload();
                });
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

            undo: function (event) {
                event.preventDefault();
                this.drawer.undo();
            },

            redo: function (event) {
                event.preventDefault();
                this.drawer.redo();
            },

            unload: function () {
                this.drawer.unload();
                return this;
            }
        });

    return new Main({ el: $("#main")[0] });
});
