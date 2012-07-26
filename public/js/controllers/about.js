/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global",
    "text!templates/about.html",
    "i18n!controllers/nls/about"
], function (global, aboutTemplate, aboutResources) {
    "use strict";

    var info = global.getInfo(),
        model = {
            r: aboutResources,
            name: info.name,
            version: info.version
        };

    return {
        pagebeforecreate: function () {
            this.render(aboutTemplate, model);
        }
    };
});
