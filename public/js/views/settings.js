/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/settings.html',
    'text!templates/languages.html',
    'i18n!nls/settings-view'
], function ($, Backbone, _, settingsTemplate, languagesTemplate,
             settingsResources) {
    'use strict';

    var DEFAULT_LOCALE = 'xx-xx';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .language': 'languageSelected'
        },

        template: _.template(settingsTemplate),
        languageBlockTemplate: _.template(languagesTemplate),

        render: function () {
            this.$el.html(this.template({
                r: settingsResources
            })).attr('id', 'settings-view')
               .attr('data-role', 'dialog')
               .page();

            this.options.environment.on(
                'change:locale',
                _.bind(this.setLanguage, this));

            this.options.environment.get('languages').on(
                'change reset',
                _.bind(this.setLanguages, this));

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
            var $openSavedPicture = this.$el.find('.open-saved-picture');

            $openSavedPicture.attr('checked',
                                   this.options.environment.get('openSavedPicture'))
                             .checkboxradio('refresh');

            this.trigger('open');
        },

        pagehide: function () {
            var $openSavedPicture = this.$el.find('.open-saved-picture');

            this.options.environment.set('openSavedPicture',
                                         $openSavedPicture[0].checked);
            this.trigger('close');
        },

        languageSelected: function (event) {
            var $this = $(event.target),
                value = $this.attr('data-value'),
                locale = (value === DEFAULT_LOCALE) ? '' : value;

            event.preventDefault();
            this.options.environment.set('locale', locale);
            window.location = '/';
        },

        setLanguage: function () {
            var locale = this.options.environment.get('locale'),
                language = locale === '' ? DEFAULT_LOCALE : locale;

            this.$el.find('.language')
                    .find('.ui-li-count')
                    .hide()
                    .end()
                    .filter('[data-value="' + language + '"]')
                    .find('.ui-li-count')
                    .show();

            return this;
        },

        setLanguages: function () {
            this.$el.find('.languages-wrapper')
                .html(this.languageBlockTemplate({
                    r: settingsResources,
                    languages: this.options.environment.get('languages')
                                                       .toJSON()
                }))
                .trigger('create');

            return this;
        }
    });
});
