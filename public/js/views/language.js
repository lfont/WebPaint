/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'models/settings',
    'collections/languages',
    'text!/templates/list-wrapper.html',
    'text!/templates/language.html',
    'i18n!views/nls/language'
], function ($, mobile, Backbone, _, settingsModel, languagesCollection,
             listWrapperTemplate, languageTemplate, languageResources) {
    'use strict';

    var DEFAULT_LOCALE = 'xx-xx';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .language': 'languageSelected'
        },

        template: _.template(listWrapperTemplate),
        
        listTemplate: _.template(languageTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: languageResources
                    }))
                    .attr('data-url', 'language')
                    .attr('data-role', 'dialog')
                    .page();

            settingsModel.on(
                'change:locale',
                _.bind(this.refreshLanguage, this));

            languagesCollection.on(
                'change reset',
                _.bind(this.refreshLanguages, this));

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagecreate: function () {
            this.refreshLanguages()
                .refreshLanguage();
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        languageSelected: function (event) {
            var $this = $(event.target),
                value = $this.attr('data-value'),
                locale = (value === DEFAULT_LOCALE) ? '' : value;

            event.preventDefault();
            settingsModel.set('locale', locale);
            window.location = '/';
        },

        refreshLanguage: function () {
            var locale = settingsModel.get('locale'),
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

        refreshLanguages: function () {
            this.$el.find('.list-wrapper')
                .html(this.listTemplate({
                    r: languageResources,
                    languages: languagesCollection.toJSON()
                }))
                .trigger('create');

            return this;
        }
    });
});
