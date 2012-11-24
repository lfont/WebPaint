/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone'
], function ($, Backbone) {
    'use strict';
    
    var SETTINGS_STORAGE_KEY = 'settings',

        localStorage = window.localStorage,
        console = window.console,
        defaultSettings = {
            locale: '',
            background: 'transparent',
            shape: 'pencil',
            strokeStyle: '#000000',
            fillStyle: '#000000',
            lineWidth: 1,
            lineCap: 'round'
        };

    return Backbone.Model.extend({
        initialize: function () {
            this.set({
                appName: 'WebPaint',
                appVersion: '0.6.11',
                screenSize: $(window).height() <= 720 ? 'small' : 'normal',
                snapshots: [],
                cursor: 0
            });
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

            $.extend(settings, defaultSettings, userSettings);

            this.set(settings);
        },

        save: function () {
            var properties = this.toJSON(),
                property;

            for (property in properties) {
                if (!defaultSettings.hasOwnProperty(property)) {
                    // The properties that were not in the default properties
                    // must not be persisted.
                    delete properties[property];
                }
            }

            localStorage.setItem(SETTINGS_STORAGE_KEY,
                                 JSON.stringify(properties));
        },

        getDefaultSettings: function () {
            return $.extend({}, defaultSettings);
        }
    });
});
