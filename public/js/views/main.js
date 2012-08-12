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
            toolsView.on("open", function () {
                drawer.off();
            });

            toolsView.on("close", function () {
                drawer.on();
            });

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
            optionsView.on("open", function () {
                drawer.off();
            });

            optionsView.on("close", function () {
                drawer.on();
            });
            
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
                    
                window.location = "/";
            });
        },

        showNetworkStatus = function (isOnline) {
            var $el = this.$el,
                isVisible = $.mobile.activePage.attr("id") === $el.attr("id"),
                $networkStatusTooltip, removedClass, addedClass, message;

            if (!isVisible) {
                return;
            }

            if (isOnline) {
                removedClass = "title-offline";
                addedClass = "title-online";
                message = mainResources.onlineMessage;
            } else {
                removedClass = "title-online";
                addedClass = "title-offline";
                message = mainResources.offlineMessage;
            }

            $el.find(".title").removeClass(removedClass)
                              .addClass(addedClass);

            $networkStatusTooltip = $("#networkStatusTooltip");
            $networkStatusTooltip.find(".message")
                                 .text(message)
                                 .end()
                                 .popup("open", {
                                    x: 0,
                                    y: 82
                                });

             window.setTimeout(function () {
                $networkStatusTooltip.popup("close");
             }, 2000);
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

            return this;
        },

        pagebeforecreate: function () {
            var $window = $(window);

            this.render();
            this.toolsView = new ToolsView({ el: $("#tools") });
            this.optionsView = new OptionsView({ el: $("#options") });

            $window.on("online", _.bind(showNetworkStatus, this, true));
            $window.on("offline", _.bind(showNetworkStatus, this, false));
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

                showNetworkStatus.call(this, window.navigator.onLine);
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
