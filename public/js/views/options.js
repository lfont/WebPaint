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
    'i18n!views/nls/options'
], function (require, $, Backbone, _, optionsTemplate, optionsResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'vclick .option': 'option'
        },

        template: _.template(optionsTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: optionsResources,
                        options: [
                            {
                                name: optionsResources['new'],
                                option: 'new'
                            },
                            {
                                name: optionsResources.save,
                                option: 'save'
                            },
                            {
                                name: optionsResources.clear,
                                option: 'clear'
                            },
                            {
                                name: optionsResources.history,
                                option: 'history'
                            },
                            {
                                name: optionsResources.invite,
                                option: 'invite'
                            },
                            {
                                name: optionsResources.language,
                                option: 'language'
                            },
                            {
                                name: optionsResources.about,
                                option: 'about'
                            }
                        ]
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
                option = $this.attr('data-option');

            event.preventDefault();

            if (option === 'save') {
                this.$el.popup('close');
                this.trigger('close');

                window.setTimeout(function () {
                    _this.trigger('save');
                }, 250);
            } else if (option === 'clear') {
                this.options.drawer[option]();
                this.$el.popup('close');
                this.trigger('close');
            } else {
                require([
                    'views/' + option
                ], function (View) {
                    if (!_this[option]) {
                        _this[option] = new View({
                            el: $('<div></div>').appendTo('body'),
                            drawer: _this.options.drawer
                        });
                        _this[option].on('close', _.bind(_this.trigger, _this, 'close'));
                        _this[option].render();
                    }

                    _this[option].show();
                });
            }
        }
    });
});
