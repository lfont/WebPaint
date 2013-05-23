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

    var MessageTooltipView = Backbone.View.extend({
        className: 'message-tooltip-view',

        template: _.template(messageTooltipTemplate),
        
        initialize: function () {
            this.isVisible = false;
        },
        
        render: function () {
            this.$el
                .html(this.template())
                .hide();

            this.$text = this.$el.find('.text');
            
            return this;
        },

        show: function () {
            this.$el.show();
            this.isVisible = true;
        },
        
        hide: function () {
            this.$el.hide();
            this.isVisible = false;
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
