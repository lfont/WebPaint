/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "global"
], function (global) {
    var DEFAULT_LOCALE = "xx-XX",
        actions,
        model = {},
        translate = function (m) {
            m.title = global.l("%language.title");
            m.information = global.l("%language.information");
            m.languages = [
                {
                    code: DEFAULT_LOCALE,
                    name: global.l("%language.default")
                },
                {
                    code: "en-US",
                    name: global.l("%language.english")
                },
                {
                    code: "fr-FR",
                    name: global.l("%language.french")
                }
            ];
        };

    return {
        pagebeforecreate: function () {
            translate(model);
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
