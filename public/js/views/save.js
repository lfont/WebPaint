/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/save.html',
    'i18n!nls/save-view'
], function ($, Backbone, _, saveTemplate, saveResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose',
            'vclick .cancel': 'cancel',
            'vclick .save': 'save'
        },

        template: _.template(saveTemplate),
        
        initialize: function () {
            this._app = this.options.app;
                
            this._environment = this._app.environment;
            this._drawerManager = this._app.drawerManager;
            this._$name = null;
            this._$data = null;
            this._$form = null;
        },

        render: function () {
            this.$el
                .html(this.template({
                    r: saveResources
                })).attr('id', 'save-view')
                .attr('data-position-to', 'window')
                .attr('data-dismissible', 'false')
                .addClass('ui-corner-all')
                .trigger('create')
                .popup();
            
            this._$name = this.$el.find('.name');
            this._$data = this.$el.find('.data');
            this._$form = this.$el.find('form');

            return this;
        },

        show: function () {
            this._$name.val('');
            this._$data.val(this._drawerManager.snapshot());
            this.$el.popup('open');
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        popupafterclose: function () {
            this.trigger('close');
        },

        cancel: function (event) {
            event.preventDefault();
            this.$el.popup('close');
        },

        save: function (event) {
            var _this = this,
                $name = this._$name,
                data = this._$data.val();

            if ($name.val() === '') {
                $name.val(saveResources.defaultFileName);
            }

            this._$form.submit();

            setTimeout(function () {
                if (_this._environment.get('openSavedPicture')) {
                    window.open(data, '_blank');
                }
                _this.$el.popup('close');
            }, 250);
        }
    });
});
