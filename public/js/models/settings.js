/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery"
], function ($) {
    "use strict";
    
    var SETTINGS_STORAGE_KEY = "settings",
        defaultSettings = {
            locale: "",
            drawer: {
                histories: [],
                shape: "pencil",
                properties: {
                    strokeStyle: "#000000",
                    fillStyle: "#000000",
                    lineWidth: 1,
                    lineCap: "round"
                }
            }
        };

    return {
        get: function () {
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

            return settings;
        },
        
        set: function (settings) {
            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(settings));
        }
    };
});
