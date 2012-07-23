define([
   "context"
], function (context) {
    var DEFAULT_LOCALE = "xx-XX",
        actions,
        model = {},
        translate = function (m) {
            m.title = context.l("%language.title");
            m.information = context.l("%language.information");
            m.languages = [
                {
                    code: DEFAULT_LOCALE,
                    name: context.l("%language.default")
                },
                {
                    code: "en-US",
                    name: context.l("%language.english")
                },
                {
                    code: "fr-FR",
                    name: context.l("%language.french")
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
            context.goBackTo("#main");
        }
    };
});
