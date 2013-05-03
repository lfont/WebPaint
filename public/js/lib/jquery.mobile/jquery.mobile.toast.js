/*
Simple toast plugin for jQuery Mobile
Loïc Fontaine - http://jsfiddle.net/loic_fontaine/kapWz/
*/

define([
    'jquery',
    'jquery.mobile'
], function ($, mobile) {
    'use strict';

    $.extend(mobile, {
        showToast: function (message, delay, callback) {
            if (typeof(delay) === 'function') {
                callback = delay;
                delay = null;
            }

            if (!delay) {
                delay = 1000;
            }

            mobile.loading('show', {
                theme: 'b',
                text: message,
                textonly: true,
                textVisible: true
            });

            setTimeout(function () {
                mobile.loading('hide');
                if (callback) {
                    callback();
                }
            }, delay);
        }
    });

    return mobile.showToast;
});
