/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'views/partial/tools',
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

        initialize: function () {
            this._app = this.options.app;
            
            this._views = {};
            this._environment = this._app.environment;
            this._drawerManager = this._app.drawerManager;
            this._$parent = null;
        },
        
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

            this._views.tools = new ToolsView({
                model: {
                    colors: this._environment.get('colors')
                                             .getDrawableColors()
                },
                drawerManager: this._drawerManager
            }).render();
            this._views.tools.$el.appendTo(this.$el.find('.tools-view-anchor'));

            this._$parent = this.$el.closest('.ui-page');
            
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
            this._views.tools.refresh();
            this.trigger('open');
            // The panelopen event is not fired the first
            // we open the panel on Firefox, so this seems
            // to be a more reliable way.
            setTimeout(function () {
                // TODO: remove this magic number
                _this._$parent
                     .css('min-height', windowHeight - 100);
            }, 0);
        },

        panelclose: function () {
            this._views.tools.store();
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
                if (!_this._views[subMenu.name]) {
                    _this._views[subMenu.name] = new View({
                        el: subMenu.type === 'page' ?
                            $('<div></div>').appendTo('body') :
                            $('<div></div>').appendTo(_this.$el
                                                           .closest('.ui-page')),
                        app: _this._app
                    })
                    .on('close', _this.trigger.bind(_this, 'close'))
                    .render();
                }

                // wait for the panel to close before navigation so
                // the url stay clean.
                _this.$el.one('panelclose', function () {
                    _this._views[subMenu.name].show();
                });

                _this.$el.panel('close');
            });
        }
    });
});
