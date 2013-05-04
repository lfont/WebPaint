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
                id: 'new',
                action: 'page'
            },
            {
                name: optionsResources.pick,
                id: 'pick',
                action: window.MozActivity ? 'activity' : 'popup',
                data: { type: [ 'image/png', 'image/jpg', 'image/jpeg' ] }
            },
            {
                name: optionsResources.save,
                id: 'save',
                action: 'popup'
            },
            {
                name: optionsResources.clear,
                id: 'clear',
                action: 'drawer'
            },
            {
                name: optionsResources.history,
                id: 'history',
                action: 'page'
            },
            {
                name: optionsResources.invite,
                id: 'invite',
                action: 'page'
            },
            {
                name: optionsResources.settings,
                id: 'settings',
                action: 'page'
            },
            {
                name: optionsResources.about,
                id: 'about',
                action: 'popup'
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

        pickActivitySuccessHanlder: function (activity) {
            var _this = this,
                image = new Image();
            image.onload = function () {
                _this.options.drawer.newDrawing(image);
            };
            image.src = URL.createObjectURL(activity.result.blob);
        },

        option: function (event) {
            var _this = this,
                selectedOptionId = $(event.target).attr('data-option'),
                option = _.find(this.optionItems, function (item) {
                    return item.id === selectedOptionId;
                });

            event.preventDefault();

            if (option.action === 'activity') {
                var activity = new MozActivity({
                    name: option.id,
                    data: option.data
                });
                 
                activity.onsuccess = function() {
                    if (option.id === 'pick') {
                        _this.pickActivitySuccessHanlder(this);
                    }
                };
                 
                activity.onerror = function () {
                    console.log('The activity encouter en error: ' + this.error);
                };

                this.$el.popup('close');
                this.trigger('close');
                return;
            }

            if (option.action === 'drawer') {
                this.options.drawer[option.id]();
                this.$el.popup('close');
                this.trigger('close');
                return;
            }

            require([
                'views/' + option.id
            ], function (View) {
                if (!_this[option.id]) {
                    _this[option.id] = new View({
                        el: option.action === 'page' ?
                            $('<div></div>').appendTo('body') :
                            $('<div></div>').appendTo(_this.$el
                                                           .closest('.ui-page')),
                        environment: _this.options.environment,
                        drawer: _this.options.drawer,
                        socket: _this.options.socket
                    });
                    _this[option.id].on('close', _this.trigger.bind(_this, 'close'));
                    _this[option.id].render();
                }

                // wait for the popup to close before navigation so
                // the url stay clean.
                _this.$el.one('popupafterclose', function () {
                    _this[option.id].show();
                });

                _this.$el.popup('close');
            });
        }
    });
});
