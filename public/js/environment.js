/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'domReady!'
], function ($) {
    'use strict';

    return {
        getAppInfo: function () {
            return {
                name: 'WebPaint',
                version: '0.6.1'
            };
        },
        
        getUIInfo: function () {
            if ($(window).height() <= 720) {
                return {
                    defaultTransition: 'none',
                    toolsViewType: 'dialog'
                };
            }

            return {
                defaultTransition: 'fade',
                toolsViewType: 'popup'
            };
        }
    };
});
