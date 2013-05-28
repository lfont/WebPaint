/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/widgets/message-tooltip.html'
], function (require, messageTooltipTemplate) {
    'use strict';
    
    var _        = require('underscore'),
        Backbone = require('backbone');
    
    var FROM_TOP_POSITION = -500,
        TO_TOP_POSITION = 0,
        ANIMATION_DURATION = 250;

    var MessageTooltipView = Backbone.View.extend({
        className: 'message-tooltip-view',

        template: _.template(messageTooltipTemplate),
        
        initialize: function () {
            this._isVisible = false;
            this._$text = null;
        },
        
        render: function () {
            this.$el
                .html(this.template())
                .css('top', FROM_TOP_POSITION)
                .hide();

            this._$text = this.$el.find('.text');
            
            return this;
        },

        show: function () {
            this.$el
                .show()
                .animate({ top: TO_TOP_POSITION }, ANIMATION_DURATION);
            this._isVisible = true;
        },
        
        hide: function () {
            var _this = this;
            this.$el
                .animate({ top: FROM_TOP_POSITION }, ANIMATION_DURATION, function () {
                    _this.$el.hide();
                    _this._isVisible = false;
                });
        },
        
        isVisible: function () {
            return this._isVisible;
        },
        
        text: function (text) {
            if (_.isString(text)) {
                this._$text
                    .html(text);
            }
            
            return this._$text.html();
        }
    });
    
    return MessageTooltipView;
});
