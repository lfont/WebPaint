/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'text!templates/options.html',
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
                name: optionsResources.settings,
                option: 'settings',
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
            })).attr('id', 'options-view')
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

            if (optionItem.type === 'action') {
                this.options.drawer[option]();
                this.$el.popup('close');
                this.trigger('close');
                return;
            }

            require([
                'views/' + option
            ], function (View) {
                if (!_this[option]) {
                    _this[option] = new View({
                        el: optionItem.type === 'page' ?
                            $('<div></div>').appendTo('body') :
                            $('<div></div>').appendTo(_this.$el
                                                           .closest('.ui-page')),
                        environment: _this.options.environment,
                        drawer: _this.options.drawer,
                        socket: _this.options.socket
                    });
                    _this[option].on('close', _this.trigger.bind(_this, 'close'));
                    _this[option].render();
                }

                // wait for the popup to close before navigation so
                // the url stay clean.
                _this.$el.one('popupafterclose', function () {
                    _this[option].show();
                });

                _this.$el.popup('close');
            });
        }
    });
});
