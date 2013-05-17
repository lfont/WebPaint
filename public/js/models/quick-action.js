/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'i18n!nls/quick-action-model'
], function (Backbone, quickActionResources) {
    'use strict';

    return Backbone.Model.extend({
        initialize: function (quickAction) {
            this.set('name', quickActionResources[quickAction.id]);
        }
    });
});
