/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "backbone",
   "underscore"
], function (Backbone, _) {
    "use strict";
    
    var SETTINGS_STORAGE_KEY = "settings",
        defaultSettings = {
            locale: "",
            background: "transparent",
            histories: [],
            shape: "pencil",
            strokeStyle: "#000000",
            fillStyle: "#000000",
            lineWidth: 1,
            lineCap: "round"
        },

        Settings = Backbone.Model.extend({
            initialize: function () {
                this.fetch();
            },

            fetch: function () {
                var settings = {},
                    settingsString = window.localStorage.getItem(
                        SETTINGS_STORAGE_KEY),
                    userSettings;

                if (settingsString) {
                    try {
                        userSettings = JSON.parse(settingsString);
                    } catch (error) {
                        console.error(error.message);
                    }
                }

                _.extend(settings, defaultSettings, userSettings);

                this.set(settings);
            },

            save: function () {
                window.localStorage.setItem(
                    SETTINGS_STORAGE_KEY,
                    JSON.stringify(this));
            }
        });

    return new Settings();
});
