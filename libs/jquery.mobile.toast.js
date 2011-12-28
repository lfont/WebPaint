/*
Simple toast plugin for jQuery Mobile
Loïc Fontaine - http://jsfiddle.net/loic_fontaine/kapWz/
*/

(function ($) {
    $.extend($.mobile, {
        showToast: function (message, delay, callback) {
            var oldMsg = $.mobile.loadingMessage,
                loaderIcon = $('.ui-loader .ui-icon'),
                loaderIconDisplay = loaderIcon.css('display');

            if (typeof(delay) === 'function') {
                callback = delay;
                delay = null;
            }

            if (!delay) {
                delay = 1000;
            }

            loaderIcon.css('display', 'none');
            $.mobile.loadingMessage = message;
            $.mobile.showPageLoadingMsg();

            setTimeout(function () {
                $.mobile.hidePageLoadingMsg();
                $.mobile.loadingMessage = oldMsg;
                loaderIcon.css('display', loaderIconDisplay);
                if (callback) {
                    callback();
                }
            }, delay);
        }
    });
}(window.jQuery));
