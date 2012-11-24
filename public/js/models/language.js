/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'i18n!nls/language-model'
], function (Backbone, languageResources) {
    'use strict';

    return Backbone.Model.extend({
        initialize: function (language) {
            this.set('name', languageResources[language.code]);
        }
    });
});
