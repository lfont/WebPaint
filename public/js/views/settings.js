/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/settings.html',
    'text!templates/languages.html',
    'i18n!nls/settings-view'
], function (require, settingsTemplate, languagesTemplate, settingsResources) {
    'use strict';

    var $        = require('jquery'),
        _        = require('underscore'),
        Backbone = require('backbone');
    
    var DEFAULT_LOCALE = 'xx-xx';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .language': 'languageSelected'
        },

        // TODO: one template per view!
        template: _.template(settingsTemplate),
        languageBlockTemplate: _.template(languagesTemplate),
        
        initialize: function () {
            this._app = this.options.app;

            this._environment = this._app.environment;
            this._$openSavedPicture = null;
            this._$language = null;
            this._$languageWrapper = null;
        },

        render: function () {
            this.$el
                .html(this.template({
                    r: settingsResources
                }))
                .attr('id', 'settings-view')
                .attr('data-role', 'dialog');

            this._$openSavedPicture = this.$el.find('.open-saved-picture');
            this._$language = this.$el.find('.language');
            this._$languageWrapper = this.$el.find('.languages-wrapper');
            
            this._environment.on('change:locale', _.bind(this.setLanguage, this));

            this._environment.get('languages').on(
                'change reset',
                _.bind(this.setLanguages, this));

            this.$el.page();
            return this;
        },

        show: function () {
            $.mobile.navigate('#settings-view');
        },

        pagecreate: function () {
            this.setLanguages()
                .setLanguage();
        },

        pagebeforeshow: function () {
            this._$openSavedPicture
                .attr('checked', this._environment.get('openSavedPicture'))
                .checkboxradio('refresh');

            this.trigger('open');
        },

        pagehide: function () {
            this._environment.set('openSavedPicture', this._$openSavedPicture[0].checked);
            this.trigger('close');
        },

        languageSelected: function (event) {
            var $this = $(event.target),
                value = $this.attr('data-value'),
                locale = (value === DEFAULT_LOCALE) ? '' : value;

            event.preventDefault();
            this._environment.set('locale', locale);
            this._app.reload();
        },

        setLanguage: function () {
            var locale = this._environment.get('locale'),
                language = locale === '' ? DEFAULT_LOCALE : locale;

            this._$language
                .find('.ui-li-count')
                .hide()
                .end()
                .filter('[data-value="' + language + '"]')
                .find('.ui-li-count')
                .show();

            return this;
        },

        setLanguages: function () {
            this._$languageWrapper
                .html(this.languageBlockTemplate({
                    r: settingsResources,
                    languages: this._environment.get('languages')
                                                .toJSON()
                }))
                .trigger('create');

            return this;
        }
    });
});
