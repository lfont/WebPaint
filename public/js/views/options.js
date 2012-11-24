/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'text!/templates/options.html',
    'i18n!nls/options-view'
], function (require, $, Backbone, _, optionsTemplate, optionsResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'vclick .option': 'option'
        },

        template: _.template(optionsTemplate),

        optionItems: [
            {
                name: optionsResources['new'],
                option: 'new',
                type: 'page'
            },
            {
                name: optionsResources.open,
                option: 'open',
                type: 'popup'
            },
            {
                name: optionsResources.save,
                option: 'save',
                type: 'popup'
            },
            {
                name: optionsResources.clear,
                option: 'clear',
                type: 'action'
            },
            {
                name: optionsResources.history,
                option: 'history',
                type: 'page'
            },
            {
                name: optionsResources.invite,
                option: 'invite',
                type: 'page'
            },
            {
                name: optionsResources.language,
                option: 'language',
                type: 'page'
            },
            {
                name: optionsResources.about,
                option: 'about',
                type: 'popup'
            }
        ],

        render: function () {
            this.$el.html(this.template({
                        r: optionsResources,
                        options: this.optionItems
                    }))
                    .addClass('options-view')
                    .trigger('create')
                    .popup();

            return this;
        },

        show: function () {
            this.$el.popup('open', {
                positionTo: this.options.positionTo
            });
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        option: function (event) {
            var _this = this,
                $this = $(event.target),
                option = $this.attr('data-option'),
                optionItem;

            event.preventDefault();

            optionItem = _.find(this.optionItems, function (item) {
                return item.option === option;
            });

            switch (optionItem.type)
            {
                case 'action':
                    this.options.drawer[option]();
                    this.$el.popup('close');
                    this.trigger('close');
                    break;
                case 'popup':
                    require([
                        'views/' + option
                    ], function (View) {
                        if (!_this[option]) {
                            _this[option] = new View({
                                el: $('<div></div>').appendTo(_this.$el.closest('.ui-page')),
                                environment: _this.options.environment,
                                drawer: _this.options.drawer
                            });
                            _this[option].on('close', _this.trigger.bind(_this, 'close'));
                            _this[option].render();
                        }

                        _this.$el.popup('close');

                        window.setTimeout(function () {
                            _this[option].show();
                        }, 250);
                    });
                    break;
                case 'page':
                    require([
                        'views/' + option
                    ], function (View) {
                        if (!_this[option]) {
                            _this[option] = new View({
                                el: $('<div></div>').appendTo('body'),
                                environment: _this.options.environment,
                                drawer: _this.options.drawer
                            });
                            _this[option].on('close', _this.trigger.bind(_this, 'close'));
                            _this[option].render();
                        }

                        _this[option].show();
                    });
                    break;
            }
        }
    });
});
