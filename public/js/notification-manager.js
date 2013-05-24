/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'views/widgets/message-tooltip'
], function (MessageTooltipView) {
    'use strict';
    
    var MESSAGE_DURATION = 2500,
        START_OFFSET = 750;
    
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
            var messageDate, startTimeout;
            
            if (messageTooltipView.isVisible) {
                messageDate = getDate();
                startTimeout = MESSAGE_DURATION -
                               (messageDate - lastMessageDate) +
                               START_OFFSET;
                
                setTimeout(function () {
                    showMessage(message);
                }, startTimeout);
            } else {
                showMessage(message);
            }
        };
    };
});
