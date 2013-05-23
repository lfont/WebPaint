/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'views/widgets/message-tooltip'
], function (MessageTooltipView) {
    'use strict';
    
    var MESSAGE_DURATION = 2500;
    
    return function NotificationManager () {
        var messageTooltipView = new MessageTooltipView(),
            lastMessageDate = 0;
        
        messageTooltipView.render().$el.appendTo('body');
        
        function getDate () {
            return Date.now();
        }
        
        function showMessage (message) {
            messageTooltipView.text(message);
            messageTooltipView.show();
            lastMessageDate = getDate();
            
            setTimeout(function () {
                messageTooltipView.hide();
            }, MESSAGE_DURATION);
        }
        
        this.push = function (message) {
            var messageDate = getDate();
            
            if (messageTooltipView.isVisible) {
                setTimeout(function () {
                    showMessage(message);
                }, MESSAGE_DURATION - (messageDate - lastMessageDate));
            } else {
                showMessage(message);
            }
        };
    };
});
