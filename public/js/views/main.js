/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "global",
    "drawerManager",
    "models/settings",
    "views/tools",
    "views/options",
    "text!templates/main.html",
    "i18n!views/nls/main"
], function ($, Backbone, _, global, DrawerManager, settingsModel, ToolsView,
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

        getToolsViewInfo = function ($window) {
            if ($window.height() <= 720) {
                return {
                    id: "#toolsDialog",
                    type: "dialog"
                };
            }

            return {
                id: "#toolsPopup",
                type: "popup"
            };
        };

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pageshow": "pageshow",
            "vclick .undo": "undo",
            "vclick .redo": "redo"
        },

        template: _.template(mainTemplate),

        render: function () {
            this.$el.html(this.template({
                r: mainResources,
                name: info.name,
                toolsView: this.toolsViewInfo
            }));

            return this;
        },

        pagebeforecreate: function () {
            var $window = $(window);

            this.toolsViewInfo = getToolsViewInfo($window);
            this.render();

            $window.on("online", _.bind(this.showNetworkStatus, this, true));
            $window.on("offline", _.bind(this.showNetworkStatus, this, false));
        },

        pageshow: function () {
            var $header, $content, $canvas;

            if (this.drawer) {
                return;
            }
            
            $header = this.$el.find("[data-role='header']");
            $content = this.$el.find("[data-role='content']");
            $canvas = this.$el.find("canvas");

            fixContentGeometry($header, $content);
            fixCanvasGeometry($content, $canvas);

            this.drawer = new DrawerManager(this.$el.find("canvas")[0]);

            this.toolsView = new ToolsView({
                el: $(this.toolsViewInfo.id),
                drawer: this.drawer
            });
            this.toolsView.on("open", _.bind(this.drawer.off, this.drawer));
            this.toolsView.on("close", _.bind(this.drawer.on, this.drawer));
            
            this.optionsView = new OptionsView({
                el: $("#options"),
                drawer: this.drawer
            });
            this.optionsView.on("open", _.bind(this.drawer.off, this.drawer));
            this.optionsView.on("close", _.bind(this.drawer.on, this.drawer));

            this.showNetworkStatus(window.navigator.onLine)
                .drawer.on();
        },

        undo: function (event) {
            event.preventDefault();
            this.drawer.undo();
        },

        redo: function (event) {
            event.preventDefault();
            this.drawer.redo();
        },

        isVisible: function () {
            return $.mobile.activePage.attr("id") === this.$el.attr("id");
        },

        showNetworkStatus: function (isOnline) {
            var $networkStatusTooltip, removedClass, addedClass, message;

            if (!this.isVisible()) {
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

            this.$el.find(".title")
                    .removeClass(removedClass)
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

             return this;
        },

        unload: function () {
            this.drawer.unload();
            return this;
        }
    });
});
