/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'text!templates/widgets/message-popup.html'
], function (Backbone, _, messagePopupTemplate) {
    'use strict';

    var MessagePopupView = Backbone.View.extend({
        attributes: {
            id: 'message-popup-view-' + Date.now(),
            'data-position-to': 'window',
            'data-dismissible': 'false'
        },
        
        className: 'message-popup-view',
        
        events: {
            'vclick .cancel': 'onCancel',
            'vclick .ok': 'onOk'
        },

        template: _.template(messagePopupTemplate),

        initialize: function () {
            this.isVisible = false;
            this._isInitialized = false;
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: {
                        title: this.options.title,
                        okButton: this.options.okButtonText,
                        cancelButton: this.options.cancelButtonText
                    }
                }))
                .hide();
            
            this.$text = this.$el.find('.text');

            return this;
        },

        show: function () {
            if (!this._isInitialized) {
                this.$el
                    .trigger('create')
                    .popup()
                    .show();
                this._isInitialized = true;
            }
            
            this.$el
                // FIXME: these values should
                // be set in the stylesheet.
                .css('max-height', '200px')
                .css('max-width', '400px')
                .popup('open');
            this.isVisible = true;
        },

        hide: function () {
            this.$el.popup('close');
            this.isVisible = false;
        },
        
        text: function (text) {
            if (_.isString(text)) {
                this.$text
                    .text(text);
            }
            
            return this.$text.text();
        },

        onCancel: function (event) {
            event.preventDefault();
            this.trigger('cancel');
        },

        onOk: function (event) {
            event.preventDefault();
            this.trigger('ok');
        }
    });
    
    return MessagePopupView;
});
