/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'text!/templates/list-wrapper.html',
    'text!/templates/language.html',
    'i18n!nls/language-view'
], function ($, mobile, Backbone, _, listWrapperTemplate, languageTemplate,
             languageResources) {
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

            this.options.environment.on(
                'change:locale',
                _.bind(this.setLanguage, this));

            this.options.environment.get('languages').on(
                'change reset',
                _.bind(this.setLanguages, this));

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagecreate: function () {
            this.setLanguages()
                .setLanguage();
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
            this.$el.find('.list-wrapper')
                .html(this.listTemplate({
                    r: languageResources,
                    languages: this.options.environment.get('languages')
                                                       .toJSON()
                }))
                .trigger('create');

            return this;
        }
    });
});
