/*
Simple toast plugin for jQuery Mobile
Loïc Fontaine - http://jsfiddle.net/loic_fontaine/kapWz/
*/

(function ($) {
    $.extend($.mobile, {
        showToast: function (message, delay, callback) {
            if (typeof(delay) === "function") {
                callback = delay;
                delay = null;
            }

            if (!delay) {
                delay = 1000;
            }

            $.mobile.showPageLoadingMsg("b", message, true);

            setTimeout(function () {
                $.mobile.hidePageLoadingMsg();
                if (callback) {
                    callback();
                }
            }, delay);
        }
    });
}(window.jQuery));
