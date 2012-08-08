/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "models/settings",
    "collections/languages",
    "text!templates/language.html",
    "text!templates/languageList.html",
    "i18n!views/nls/language"
], function ($, Backbone, _, settingsModel, languagesCollection,
             languageTemplate, languageListTemplate, languageResources) {
    "use strict";

    var DEFAULT_LOCALE = "xx-xx",

        Language = Backbone.View.extend({
            events: {
                "pagebeforecreate": "pagebeforecreate",
                "pagecreate": "pagecreate",
                "vclick .language": "languageSelected"
            },

            template: _.template(languageTemplate),
            
            listTemplate: _.template(languageListTemplate),

            render: function () {
                this.$el.html(this.template({
                    r: languageResources
                }));

                this.$el.find(".language-list")
                        .html(this.listTemplate({
                            languages: languagesCollection.toJSON()
                        }));

                return this;
            },

            initialize: function () {
                var that = this;

                settingsModel.on("change:locale", function (settings) {
                    var locale = settingsModel.get("locale"),
                        language = locale === "" ? DEFAULT_LOCALE : locale;

                    that.$el.find(".language")
                        .find(".ui-li-count")
                        .hide()
                        .end()
                        .filter("[data-value='" + language + "']")
                        .find(".ui-li-count")
                        .show();
                });
            },

            pagebeforecreate: function () {
                this.render();
            },

            pagecreate: function () {
                settingsModel.trigger("change:locale", settingsModel);
            },

            languageSelected: function (event) {
                var $this = $(event.target),
                    value = $this.attr("data-value"),
                    locale = (value === DEFAULT_LOCALE) ? "" : value;

                event.preventDefault();
                this.trigger("language", locale);
            }
        });

    return new Language({ el: $("#language") });
});
