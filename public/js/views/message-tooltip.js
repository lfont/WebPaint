/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'text!templates/message-tooltip.html'
], function (Backbone, _, messageTooltipTemplate) {
    'use strict';

    var MessageTooltipView = Backbone.View.extend({
        attributes: {
            'id': 'message-tooltip-view',
            'data-position-to': 'window',
            'data-theme': 'b',
            'data-dismissible': 'false'
        },
        
        className: 'message-tooltip-view, ui-content',
        
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose'
        },
        
        template: _.template(messageTooltipTemplate),
        
        initialize: function () {
            this._clearTimeoutId = null;
            this._isInitialized = false;
        },

        render: function () {
            var _this = this;

            this.$el
                .html(this.template())
                .hide();
            
            this._$text = this.$el.find('.text');

            return this;
        },

        show: function () {
            var _this = this;
            
            if (!this._isInitialized) {
                this.$el
                    .trigger('create')
                    .popup();
                this._isInitialized = true;
            }
            
            this.$el.popup('open');
            
            if (this.options.closeTimeout) {
                this._clearTimeoutId = setTimeout(function () {
                    _this._clearTimeoutId = null;
                    _this.$el.popup('close');
                }, this.options.closeTimeout);
            }
        },
        
        hide: function () {
            this.$el.popup('close');
        },
        
        text: function (text) {
            if (_.isString(text)) {
                this._$text.text(text);
            }
            
            return this._$text.text();
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        popupafterclose: function () {
            this.trigger('close');
            if (this._clearTimeoutId) {
                clearTimeout(this._clearTimeoutId);
            }
        }
    });
    
    return MessageTooltipView;
});
