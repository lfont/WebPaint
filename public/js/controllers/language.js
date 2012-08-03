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
        };

    return {
        initialize: function () {
            this.on({
                localeChange: function (sender, locale) {
                    model.locale = locale === "" ? DEFAULT_LOCALE : locale;
                }
            });
        },
        pagebeforecreate: function () {
            this.render(languageTemplate, model);
        },
        pagebeforeshow: function () {
            this.render(
                    languageListTemplate,
                    this.find(".languageListAnchor"),
                    model)
                .trigger("create");
        },
        setLocale: function (context) {
            var locale = context.get("locale");

            locale = (locale === DEFAULT_LOCALE) ? "" : locale;
            this.emit("locale", locale);
            global.goBackTo("main");
        }
    };
});
