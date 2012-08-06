/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "views/language",
    "views/newDrawing",
    "views/history",
    "text!templates/options.html",
    "i18n!views/nls/options"
], function ($, Backbone, _, languageView, newDrawingView, historyView,
             optionsTemplate, optionsResources) {
    "use strict";

    var Options =  Backbone.View.extend({
            events: {
                "pagebeforecreate": "pagebeforecreate",
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
                            action: "save"
                        },
                        {
                            name: optionsResources.clear,
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

            pagebeforecreate: function () {
                this.render();
            },

            actionSelected: function (event) {
                var $this = $(event.target),
                    action = $this.attr("data-value");

                event.preventDefault();

                this.trigger(action);

                $.mobile.changePage("#main", { reverse: true });
            }
        });

    return new Options({ el: $("#options")[0] });
});
