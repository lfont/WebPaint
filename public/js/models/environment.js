/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore'
], function (Backbone, _) {
    'use strict';
    
    var SETTINGS_STORAGE_KEY = 'settings',
        DEFAULT_SETTINGS = {
            locale: '',
            background: 'transparent',
            shape: 'pencil',
            strokeStyle: '#000000',
            fillStyle: '#000000',
            lineWidth: 1,
            lineCap: 'round',
            openSavedPicture: false
        },

        localStorage = window.localStorage,
        console = window.console;

    return Backbone.Model.extend({
        defaults: {
            snapshots: [],
            cursor: 0
        },

        fetch: function () {
            var settings = {},
                settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY),
                userSettings;

            if (settingsString) {
                try {
                    userSettings = JSON.parse(settingsString);
                } catch (error) {
                    console.error(error.message);
                }
            }

            _.extend(settings, DEFAULT_SETTINGS, userSettings);

            this.set(settings);
        },

        save: function () {
            var properties = this.toJSON(),
                property;

            for (property in properties) {
                if (!DEFAULT_SETTINGS.hasOwnProperty(property)) {
                    // The properties that were not in the default properties
                    // must not be persisted.
                    delete properties[property];
                }
            }

            localStorage.setItem(SETTINGS_STORAGE_KEY,
                                 JSON.stringify(properties));
        },

        getDefaultSettings: function () {
            var settings = {};

            _.extend(settings, DEFAULT_SETTINGS);

            return settings;
        }
    });
});
