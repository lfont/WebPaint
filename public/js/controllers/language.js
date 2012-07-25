/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global",
   "i18n!controllers/nls/language"
], function (global, language) {
    var DEFAULT_LOCALE = "xx-xx",
        actions,
        model = {
            r: language,
            languages: [
                {
                    code: DEFAULT_LOCALE,
                    name: language["default"]
                },
                {
                    code: "en-us",
                    name: language.english
                },
                {
                    code: "fr-fr",
                    name: language.french
                }
            ]
        };

    return {
        pagebeforecreate: function () {
            this.render("pagebeforecreate", model);
        },
        pagebeforeshow: function (req) {
            var appLocale = req.get("locale");

            actions = req.get("actions");
            model.locale = (appLocale === "") ? DEFAULT_LOCALE : appLocale;
            this.render("pagebeforeshow", model).trigger("create");
        },
        setLocale: function (req) {
            var locale = req.get("locale");

            locale = (locale === DEFAULT_LOCALE) ? "" : locale;
            actions.setLocale(locale);
            global.goBackTo("#main");
        }
    };
});
