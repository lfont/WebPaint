/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global",
   "text!templates/language.html",
   "text!templates/languageList.html",
   "i18n!controllers/nls/language"
], function (global, languageTemplate, languageListTemplate, languageResources) {
    "use strict";

    var DEFAULT_LOCALE = "xx-xx",
        model = {
            r: languageResources,
            languages: [
                {
                    code: DEFAULT_LOCALE,
                    name: languageResources["default"]
                },
                {
                    code: "en-us",
                    name: languageResources.english
                },
                {
                    code: "fr-fr",
                    name: languageResources.french
                }
            ]
        },

        messageHandlers = {
            locale: function (locale) {
                model.locale = locale === "" ? DEFAULT_LOCALE : locale;
            }
        };

    return {
        pagebeforecreate: function () {
            this.render(languageTemplate, model);
        },
        pagebeforeshow: function () {
            this.render(
                    languageListTemplate,
                    this.$el.find(".languageListAnchor"),
                    model)
                .trigger("create");
        },
        setLocale: function (context) {
            var locale = context.get("locale");

            locale = (locale === DEFAULT_LOCALE) ? "" : locale;
            this.send("main", "locale", locale);
            global.goBackTo("main");
        },
        onMessage: function (message, data) {
            messageHandlers[message.name](data);
        }
    };
});
