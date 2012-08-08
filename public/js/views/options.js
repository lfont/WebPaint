/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "views/newDrawing",
    "views/history",
    "views/language",
    "views/about",
    "text!templates/options.html",
    "i18n!views/nls/options"
], function ($, Backbone, _, newDrawingView, historyView, languageView,
             aboutView, optionsTemplate, optionsResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "vclick .action": "actionSelected"
        },

        template: _.template(optionsTemplate),

        render: function () {
            this.$el.html(this.template({
                r: optionsResources,
                options: [
                    {
                        name: optionsResources["new"],
                        link: "#newDrawing"
                    },
                    {
                        name: optionsResources.saveAs,
                        link: "#",
                        action: "save"
                    },
                    {
                        name: optionsResources.clear,
                        link: "#",
                        action: "clear"
                    },
                    {
                        name: optionsResources.history,
                        link: "#history"
                    },
                    {
                        name: optionsResources.language,
                        link: "#language"
                    },
                    {
                        name: optionsResources.about,
                        link: "#about"
                    }
                ]
            }));

            return this;
        },

        initialize: function () {
            var that = this;

            this.render();

            languageView.on("language", function (locale) {
                that.trigger("language", locale);
                $.mobile.changePage("#main", { reverse: true });
            });

            newDrawingView.on("newDrawing", function (background) {
                that.trigger("newDrawing", background);
                $.mobile.changePage("#main", { reverse: true });
            });

            historyView.on("history", function (index) {
                that.trigger("history", index);
                $.mobile.changePage("#main", { reverse: true });
            });
        },

        actionSelected: function (event) {
            var $this = $(event.target),
                action = $this.attr("data-value");

            event.preventDefault();
            this.trigger(action);
            $.mobile.changePage("#main", { reverse: true });
        }
    });
});
