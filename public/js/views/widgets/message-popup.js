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
            this._title = this.options.title;
            this._okButtonText = this.options.okButtonText;
            this._cancelButtonText = this.options.cancelButtonText;
            
            this._isVisible = false;
            this._isInitialized = false;
            this._$text = null;
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: {
                        title: this._title,
                        okButton: this._okButtonText,
                        cancelButton: this._cancelButtonText
                    }
                }))
                .hide();
            
            this._$text = this.$el.find('.text');

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
            
            this.$el.popup('open');
            this._isVisible = true;
        },

        hide: function () {
            this.$el.popup('close');
            this._isVisible = false;
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
