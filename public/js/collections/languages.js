/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "backbone",
    "models/language"
], function (Backbone, LanguageModel) {
    "use strict";

    var Languages = Backbone.Collection.extend({
        model: LanguageModel
    });

    return new Languages([
        { code: "xx-xx" },
        { code: "en-us" },
        { code: "fr-fr" }
    ]);
});
