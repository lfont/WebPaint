define([
   "jquery",
   "lib/l10n"
], function ($) {
    "use strict";

    return {
        colors: function () {
            return [
                {
                    code: "transparent",
                    name: this.l("%transparent")
                },
                {
                    code: "#000000",
                    name: this.l("%black")
                },
                {
                    code: "#d2691e",
                    name: this.l("%chocolate")
                },
                {
                    code: "#ffffff",
                    name: this.l("%white")
                },
                {
                    code: "#ffc0cb",
                    name: this.l("%pink")
                },
                {
                    code: "#ff0000",
                    name: this.l("%red")
                },
                {
                    code: "#ffa500",
                    name: this.l("%orange")
                },
                {
                    code: "#ee82ee",
                    name: this.l("%violet")
                },
                {
                    code: "#0000ff",
                    name: this.l("%blue")
                },
                {
                    code: "#40e0d0",
                    name: this.l("%turquoise")
                },
                {
                    code: "#008000",
                    name: this.l("%green")
                },
                {
                    code: "#ffff00",
                    name: this.l("%yellow")
                }
            ];
        },
        l: function (string) {
            return string.toLocaleString();
        },
        goBackTo: function (pageName) {
            $.mobile.changePage(pageName, { reverse: true });
        }
    };
});
