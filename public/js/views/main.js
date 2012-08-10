/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery",
   "backbone",
   "underscore",
   "drawerManager",
   "global",
   "models/settings",
   "views/tools",
   "views/options",
   "text!templates/main.html",
   "i18n!views/nls/main"
], function ($, Backbone, _, DrawerManager, global, settingsModel, ToolsView,
             OptionsView, mainTemplate, mainResources) {
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

        bindToolsViewEventsHandlers = function (toolsView, drawer) {
            toolsView.on("shape", function (name) {
                drawer.setShape(name);
            });
            
            toolsView.on("color", function (hex) {
                drawer.setColor(hex);
            });

            toolsView.on("lineWidth", function (value) {
                drawer.setLineWidth(value);
            });
        },

        bindOptionsViewEventsHandlers = function (optionsView, drawer) {
            optionsView.on("newDrawing", function (hex) {
                drawer.newDrawing(hex);
            });

            optionsView.on("clear", function () {
                drawer.clear();
            });

            optionsView.on("history", function (value) {
                drawer.setHistory(value);
            });

            optionsView.on("save", function () {
                drawer.save();
            });

            optionsView.on("language", function (locale) {
                settingsModel.set({
                    locale: locale
                });
                    
                window.location.reload();
            });
        };

    return Backbone.View.extend({
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

            $("#network-status-tooltip").popup();

            return this;
        },

        pagebeforecreate: function () {
            var that = this,
                $window = $(window),

                windowOnLineEventHandler = function () {
                    var $el = that.$el,
                        $title = $el.find(".title"),
                        $networkStatusTooltip = $("#network-status-tooltip");

                    $title.removeClass("offline")
                          .addClass("online");

                    /*$networkStatusTooltip.find(".message")
                                         .text("online");

                    $networkStatusTooltip.popup("open");

                     window.setTimeout(function () {
                        $networkStatusTooltip.popup("close");
                     }, 3000);*/
                },

                windowOffLineEventHandler = function () {
                    var $el = that.$el,
                        $title = $el.find(".title"),
                        $networkStatusTooltip = $("#network-status-tooltip");

                    $title.removeClass("online")
                          .addClass("offline");

                    /*$networkStatusTooltip.find(".message")
                                         .text("offline")
                                         .end()
                                         .popup("open");

                     window.setTimeout(function () {
                        $networkStatusTooltip.popup("close");
                     }, 3000);*/
                };

            this.render();
            this.toolsView = new ToolsView({ el: $("#tools") });
            this.optionsView = new OptionsView({ el: $("#options") });

            $window.on("online", windowOnLineEventHandler);
            $window.on("offline", windowOffLineEventHandler);

            if (window.navigator.onLine) {
                windowOnLineEventHandler();
            } else {
                windowOffLineEventHandler();
            }
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

                bindToolsViewEventsHandlers(this.toolsView, this.drawer);
                bindOptionsViewEventsHandlers(this.optionsView, this.drawer);
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
});
