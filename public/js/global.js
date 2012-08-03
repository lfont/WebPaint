/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
   "jquery"
], function ($) {
    "use strict";

    return {
        getInfo: function () {
            return {
                name: "WebPaint",
                version: "0.4.9"
            };
        },
        
        getCoreMVCOptions: function () {
            return {
                events: [
                    "pagebeforecreate",
                    "pagecreate",
                    "pagebeforeshow",
                    "pageshow",
                    "pagebeforehide",
                    "pagehide"
                ]
            };
        },

        goBackTo: function (pageName) {
            $.mobile.changePage(pageName, { reverse: true });
        }
    };
});
