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

    var DEFAULT_LOCALE = "xx-xx";

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pagecreate": "pagecreate",
            "pagebeforeshow": "pagebeforeshow",
            "pagehide": "pagehide",
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
            settingsModel.on(
                "change:locale",
                _.bind(this.refreshLanguage, this));
        },

        pagebeforecreate: function () {
            this.render();
        },

        pagecreate: function () {
            this.refreshLanguage();
        },

        pagebeforeshow: function () {
            this.trigger("open");
        },

        pagehide: function () {
            this.trigger("close");
        },

        languageSelected: function (event) {
            var $this = $(event.target),
                value = $this.attr("data-value"),
                locale = (value === DEFAULT_LOCALE) ? "" : value;

            event.preventDefault();
            settingsModel.set("locale", locale);
            window.location = "/";
        },

        refreshLanguage: function () {
            var locale = settingsModel.get("locale"),
                language = locale === "" ? DEFAULT_LOCALE : locale;

            this.$el.find(".language")
                .find(".ui-li-count")
                .hide()
                .end()
                .filter("[data-value='" + language + "']")
                .find(".ui-li-count")
                .show();

            return this;
        }
    });
});
