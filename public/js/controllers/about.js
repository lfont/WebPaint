define([
    "context"
], function (context) {
    var model = {
            version: "WebPaint 0.4.5"
        },
        translate = function (m) {
            m.title = context.l("%about.title");
            m.description = context.l("%about.description");
            m.source = context.l("%about.source");
            m.follow = context.l("%about.follow");
        };

    return {
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
        }
    };
});
