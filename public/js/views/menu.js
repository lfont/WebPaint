/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'views/tools',
    'text!templates/menu.html',
    'i18n!nls/menu-view'
], function (require, $, Backbone, _, ToolsView, menuTemplate, menuResources) {
    'use strict';

    var windowHeight = $(window).height();

    return Backbone.View.extend({
        events: {
            'panelbeforeopen': 'panelbeforeopen',
            'panelclose': 'panelclose',
            'vclick .sub-menu button': 'showSubMenuHandler'
        },

        template: _.template(menuTemplate),

        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                    r: menuResources
                }))
                .attr('id', 'menu-view')
                .attr('data-display', 'overlay')
                .attr('data-theme', 'a')
                .addClass('menu-view');

            this.toolsView = new ToolsView({
                model: {
                    colors: this.options.environment.get('colors')
                                                    .getDrawableColors()
                },
                drawerManager: this.options.drawerManager
            }).render();

            this.toolsView.$el.appendTo(this.$el.find('.tools-view-anchor'));

            this.$parent = this.$el.closest('.ui-page');
            this.$el.trigger('create')
                    .panel()
                    .css('overflow-y', 'scroll')
                    // TODO: remove this magic number
                    .css('min-height', windowHeight - 1)
                    .css('max-height', windowHeight - 1);

            return this;
        },

        show: function () {
            this.$el.panel('open');
        },

        panelbeforeopen: function () {
            var _this = this;
            this.toolsView.refresh();
            this.trigger('open');
            // The panelopen event is not fired the first
            // we open the panel on Firefox, so this seems
            // to be a more reliable way.
            setTimeout(function () {
                // TODO: remove this magic number
                _this.$parent
                     .css('min-height', windowHeight - 100);
            }, 0);
        },

        panelclose: function () {
            this.toolsView.store();
            this.trigger('close');
        },

        showSubMenuHandler: function (event) {
            var _this = this,
                $subMenu = $(event.target),
                subMenu = {
                    name: $subMenu.data('menu-name'),
                    type: $subMenu.data('menu-type')
                };

            event.preventDefault();

            require([
                'views/' + subMenu.name
            ], function (View) {
                if (!_this[subMenu.name]) {
                    _this[subMenu.name] = new View({
                        el: subMenu.type === 'page' ?
                            $('<div></div>').appendTo('body') :
                            $('<div></div>').appendTo(_this.$el
                                                           .closest('.ui-page')),
                        environment: _this.options.environment,
                        drawerManager: _this.options.drawerManager,
                        drawingClient: _this.options.drawingClient
                    });
                    _this[subMenu.name].on('close', _this.trigger.bind(_this, 'close'));
                    _this[subMenu.name].render();
                }

                // wait for the panel to close before navigation so
                // the url stay clean.
                _this.$el.one('panelclose', function () {
                    _this[subMenu.name].show();
                });

                _this.$el.panel('close');
            });
        }
    });
});
