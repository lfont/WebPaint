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
    "views/invite",
    "views/language",
    "views/about",
    "text!templates/options.html",
    "i18n!views/nls/options"
], function ($, Backbone, _, NewDrawingView, HistoryView, InviteView,
             LanguageView, AboutView, optionsTemplate, optionsResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "popupbeforeposition": "popupbeforeposition",
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
                        name: optionsResources.save,
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
                        name: optionsResources.invite,
                        link: "#invite"
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

            this.$el.trigger("create");

            return this;
        },

        initialize: function () {
            var that = this;

            this.render();

            this.newDrawingView = new NewDrawingView({
                el: $("#newDrawing"),
                drawer: this.options.drawer
            });
            this.newDrawingView.on("close", _.bind(this.trigger, this, "close"));

            this.historyView = new HistoryView({
                el: $("#history"),
                drawer: this.options.drawer
            });
            this.historyView.on("close", _.bind(this.trigger, this, "close"));

            this.inviteView = new InviteView({
                el: $("#invite"),
                socket: this.options.socket
            });
            this.inviteView.on("close", _.bind(this.trigger, this, "close"));

            this.languageView = new LanguageView({
                el: $("#language")
            });
            this.languageView.on("close", _.bind(this.trigger, this, "close"));

            this.aboutView = new AboutView({
                el: $("#about")
            });
            this.aboutView.on("close", _.bind(this.trigger, this, "close"));
        },

        popupbeforeposition: function () {
            this.trigger("open");
        },

        actionSelected: function (event) {
            var $this = $(event.target),
                action = $this.attr("data-value");

            event.preventDefault();
            this.options.drawer[action]();
            $.mobile.changePage("#main", { reverse: true });
            this.trigger("close");
        }
    });
});
