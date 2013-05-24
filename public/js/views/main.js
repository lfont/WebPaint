/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'sprintf',
    'drawer-manager',
    'drawing-client',
    'views/widgets/message-popup',
    'text!templates/main.html',
    'i18n!nls/main-view'
], function (require, $, Backbone, _, sprintf, DrawerManager,
             DrawingClient, MessagePopupView, mainTemplate, mainResources) {
    'use strict';

    function fixContentGeometry ($header, $content) {
        var contentHeight;

        contentHeight = $(window).height() - $header.outerHeight() -
                        ($content.outerHeight() - $content.height());

        $content.height(contentHeight);
    }

    return Backbone.View.extend({
        attributes: { 'id': 'main-view', 'data-role': 'page' },
        
        className: 'main-view',
        
        events: {
            'pageshow': 'pageshow',
            'vclick .menu': 'showMenu',
            'vclick .quick-actions': 'showQuickActions'
        },

        template: _.template(mainTemplate),

        render: function () {
            var _this = this;

            this.$el
                .html(this.template({
                    r: mainResources,
                    name: this.options.environment.get('appName')
                }));
            
            this.inviteMessagePopupView = new MessagePopupView({
                title: mainResources.inviteTitle,
                okButtonText: mainResources.acceptButton,
                cancelButtonText: mainResources.rejectButton
            }).render();
            this.inviteMessagePopupView.$el.appendTo(this.$el);

            if (this.options.environment.get('screenSize') !== 'small') {
                require([
                    'views/partial/social-widgets'
                ], function (SocialWidgetsView) {
                    var socialWidgetsView = new SocialWidgetsView();
                    socialWidgetsView.render()
                                     .$el
                                     .appendTo(_this.$el.find('.social-widgets-anchor'));
                });
            }

            return this;
        },

        show: function () {
            $.mobile.navigate('#main-view');
            return this;
        },

        pageshow: function () {
            if (this.drawerManager) {
                return;
            }

            fixContentGeometry(this.$el.find('[data-role="header"]'),
                               this.$el.find('[data-role="content"]'));

            this.drawerManager = new DrawerManager(this.$el.find('canvas'),
                                                   this.options.environment);

            this.drawingClient = new DrawingClient(this.drawerManager,
                                                   this.options.environment);
            this.drawingClient.on('inviteRequest',
                                  this.onInviteRequest,
                                  this)
                              .on('inviteRequestCanceled',
                                  this.onInviteRequestCanceled,
                                  this);

            $(window).on('online', this.showNetworkStatus.bind(this, true))
                     .on('offline', this.showNetworkStatus.bind(this, false));

            this.showNetworkStatus(navigator.onLine);
            this.drawerManager.on();
        },

        onInviteRequest: function (nickname) {
            this.inviteMessagePopupView.text(sprintf(mainResources.inviteRequest,
                                                     nickname));
            
            this.inviteMessagePopupView.once('ok', function () {
                this.drawingClient.sendResponse(nickname, true);
                this.inviteMessagePopupView.off('cancel');
                this.inviteMessagePopupView.hide();
            }, this);
            
            this.inviteMessagePopupView.once('cancel', function () {
                this.drawingClient.sendResponse(nickname, false);
                this.inviteMessagePopupView.off('ok');
                this.inviteMessagePopupView.hide();
            }, this);
            
            this.inviteMessagePopupView.show();
        },
        
        onInviteRequestCanceled: function (nickname) {
            this.inviteMessagePopupView.off('ok')
                                       .off('cancel')
                                       .hide();
        },

        showNetworkStatus: function (isOnline) {
            var removedClass, addedClass, message;

            if (isOnline) {
                removedClass = 'title-offline';
                addedClass = 'title-online';
                message = mainResources.onlineMessage;
            } else {
                removedClass = 'title-online';
                addedClass = 'title-offline';
                message = mainResources.offlineMessage;
            }

            this.$el.find('.title')
                    .removeClass(removedClass)
                    .addClass(addedClass)
                    .attr('title', message);
            
            this.options.environment.get('notificationManager')
                                    .push(message);

            return this;
        },

        showMenu: function (event) {
            var _this = this;
            event.preventDefault();

            require([
                'views/menu'
            ], function (MenuView) {
                if (!_this.menuView) {
                    _this.menuView = new MenuView({
                        el: $('<div></div>').prependTo(_this.$el),
                        environment: _this.options.environment,
                        drawerManager: _this.drawerManager,
                        drawingClient: _this.drawingClient
                    });
                    _this.menuView.on('open', _this.drawerManager.off,
                                      _this.drawerManager);
                    _this.menuView.on('close', _this.drawerManager.on,
                                      _this.drawerManager);
                    _this.menuView.render();
                }

                _this.menuView.show();
            });
        },

        showQuickActions: function (event) {
            var _this = this;
            event.preventDefault();

            require([
                'views/quick-actions'
            ], function (QuickActionsView) {
                if (!_this.quickActionsView) {
                    _this.quickActionsView = new QuickActionsView({
                        el: $('<div></div>').appendTo(_this.$el),
                        collection: _this.options.environment.get('actions'),
                        positionTo: event.target,
                        environment: _this.options.environment,
                        drawerManager: _this.drawerManager,
                        drawingClient: _this.drawingClient
                    });
                    _this.quickActionsView.on('open', _this.drawerManager.off,
                                              _this.drawerManager);
                    _this.quickActionsView.on('close', _this.drawerManager.on,
                                              _this.drawerManager);
                    _this.quickActionsView.render();
                }

                _this.quickActionsView.show();
            });
        }
    });
});
