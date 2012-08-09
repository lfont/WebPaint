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
        };

    return Backbone.View.extend({
        events: {
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
            var that = this;

            this.render();

            this.toolsView = new ToolsView({ el: $("#tools") });

            this.toolsView.on("shape", function (name) {
                that.drawer.setShape(name);
            });
            
            this.toolsView.on("color", function (hex) {
                that.drawer.setColor(hex);
            });

            this.toolsView.on("lineWidth", function (value) {
                that.drawer.setLineWidth(value);
            });

            this.optionsView = new OptionsView({ el: $("#options") });

            this.optionsView.on("newDrawing", function (hex) {
                that.drawer.newDrawing(hex);
            });

            this.optionsView.on("clear", function () {
                that.drawer.clear();
            });

            this.optionsView.on("history", function (value) {
                that.drawer.setHistory(value);
            });

            this.optionsView.on("save", function () {
                that.drawer.save();
            });

            this.optionsView.on("language", function (locale) {
                settingsModel.set({
                    locale: locale
                });
                    
                window.location.reload();
            });
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
});
