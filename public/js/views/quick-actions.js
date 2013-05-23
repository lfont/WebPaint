/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'views/partial/quick-action-group',
    'text!templates/quick-actions.html'
], function (require, $, Backbone, _, QuickActionGroupView, quickActionsTemplate) {
    'use strict';

    var QuickActionsView = Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition'
        },

        template: _.template(quickActionsTemplate),

        render: function () {
            var $quickActionGroupAnchor;

            this.$el
                .html(this.template())
                .attr('id', 'quick-actions-view')
                .addClass('quick-actions-view');

            $quickActionGroupAnchor = this.$el.find('.quick-action-group-anchor');

            _.each(this.collection, function (action) {
                var quickActionGroupView = _.isArray(action) ?
                    new QuickActionGroupView({ collection: action }) :
                    new QuickActionGroupView({ collection: [ action ] });

                quickActionGroupView.on('selected', function (quickAction) {
                    this.callHandlerForAction(quickAction.toJSON());
                }, this);

                quickActionGroupView.render().$el.appendTo($quickActionGroupAnchor);
            }, this);

            this.$el.trigger('create')
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
                _this.options.drawerManager.newDrawing(image);
            };
            image.src = URL.createObjectURL(activity.result.blob);
        },

        activityActionHandler: function (action) {
            var _this = this,
                activity = new MozActivity({
                    name: action.id,
                    data: action.data
                });

            activity.onsuccess = function() {
                if (action.id === 'pick') {
                    _this.pickActivitySuccessHanlder(this);
                }
            };

            activity.onerror = function () {
                console.log('The activity encouter en error: ' + this.error);
            };

            this.$el.popup('close');
            this.trigger('close');
        },

        drawerActionHandler: function (action) {
            this.options.drawerManager[action.id]();
            this.$el.popup('close');
            this.trigger('close');
        },

        pageActionHandler: function (action) {
            var _this = this;

            require([
                'views/' + action.id
            ], function (View) {
                if (!_this[action.id]) {
                    _this[action.id] = new View({
                        el: action.type === 'page' ?
                            $('<div></div>').appendTo('body') :
                            $('<div></div>').appendTo(_this.$el
                                                           .closest('.ui-page')),
                        environment: _this.options.environment,
                        drawerManager: _this.options.drawerManager,
                        drawingClient: _this.options.drawingClient
                    });
                    _this[action.id].on('close', _this.trigger.bind(_this, 'close'));
                    _this[action.id].render();
                }

                // wait for the popup to close before navigation so
                // the url stay clean.
                _this.$el.one('popupafterclose', function () {
                    _this[action.id].show();
                });

                _this.$el.popup('close');
            });
        },

        popupActionHandler: function (action) {
            this.pageActionHandler(action);
        },

        callHandlerForAction: function (action) {
            var actionHandler = action.type + 'ActionHandler';

            if (this[actionHandler]) {
                this[actionHandler](action);
            } else {
                throw new Error('The action type: ' + action.type +
                                ' cannot be handled.');
            }
        }
    });

    return QuickActionsView;
});
