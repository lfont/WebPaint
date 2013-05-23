/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'text!templates/widgets/message-tooltip.html'
], function (Backbone, _, messageTooltipTemplate) {
    'use strict';
    
    var FROM_TOP_POSITION = -500,
        TO_TOP_POSITION = 0,
        ANIMATION_DURATION = 250;

    var MessageTooltipView = Backbone.View.extend({
        className: 'message-tooltip-view',

        template: _.template(messageTooltipTemplate),
        
        initialize: function () {
            this.isVisible = false;
        },
        
        render: function () {
            this.$el
                .html(this.template())
                .css('top', FROM_TOP_POSITION)
                .hide();

            this.$text = this.$el.find('.text');
            
            return this;
        },

        show: function () {
            this.$el
                .show()
                .animate({ top: TO_TOP_POSITION }, ANIMATION_DURATION);
            this.isVisible = true;
        },
        
        hide: function () {
            var _this = this;
            this.$el
                .animate({ top: FROM_TOP_POSITION }, ANIMATION_DURATION, function () {
                    _this.$el.hide();
                    _this.isVisible = false;
                });
        },
        
        text: function (text) {
            if (_.isString(text)) {
                this.$text
                    .text(text);
            }
            
            return this.$text.text();
        }
    });
    
    return MessageTooltipView;
});
