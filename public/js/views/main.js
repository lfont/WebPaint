/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'views/widgets/message-popup',
    'views/partial/social-widgets',
    'views/menu',
    'views/quick-actions',
    'text!templates/main.html',
    'i18n!nls/main-view'
], function (require, MessagePopupView, SocialWidgetsView,
             MenuView, QuickActionsView, mainTemplate, mainResources) {
    'use strict';
    
    var $        = require('jquery'),
        _        = require('underscore'),
        Backbone = require('backbone'),
        sprintf  = require('sprintf');

    function fixContentGeometry ($header, $content) {
        var contentHeight;

        contentHeight = $(window).height() - $header.outerHeight() -
                        ($content.outerHeight() - $content.height());

        $content.height(contentHeight);
    }

    return Backbone.View.extend({
        attributes: {
            id: '/',
            'data-role': 'page',
            'data-url': '/'
        },
        
        className: 'main-view',
        
        events: {
            'pageshow': 'pageshow',
            'vclick .menu': 'showMenu',
            'vclick .quick-actions': 'showQuickActions'
        },

        template: _.template(mainTemplate),

        initialize: function () {
            var cacheUpdatePromise;
            
            this._app = this.options.app;
            
            this._views = {};
            this._environment = this._app.environment;
            this._notificationManager = this._app.notificationManager;
            this._drawingClient = null;
            this._drawerManager = null;
            this._hasUpdate = false;
            this._$title = null;
            
            this._app.on('ready', function () {
                this._drawingClient = this._app.drawingClient;
                this._drawingClient
                    .on('inviteRequest',
                        this.onInviteRequest,
                        this)
                    .on('inviteRequestCanceled',
                        this.onInviteRequestCanceled,
                        this);
                
                this._drawerManager = this._app.drawerManager;
                this._drawerManager.on();
                
                this._app.on('online', this.showNetworkStatus.bind(this, true))
                         .on('offline', this.showNetworkStatus.bind(this, false))
                         .on('updateready', this.onCacheUpdate, this);
            }, this);
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: mainResources,
                    name: this._environment.get('appName')
                }));
            
            this._$title = this.$el.find('.title');
            
            // popup for the invites
            this._views.inviteMessage = new MessagePopupView({
                title: mainResources.inviteTitle,
                okButtonText: mainResources.acceptButton,
                cancelButtonText: mainResources.rejectButton
            }).render();
            this._views.inviteMessage.$el.appendTo(this.$el);

            // popup for the updates
            this._views.updateMessage = new MessagePopupView({
                title: mainResources.updateTitle,
                okButtonText: mainResources.updateNowButton,
                cancelButtonText: mainResources.updateLaterButton
            })
            .on('ok', this._app.reload, this._app)
            .on('cancel', function () {
                this._hasUpdate = false;
                this._views.updateMessage.hide();
            }, this)
            .render();
            this._views.updateMessage.text(mainResources.updateReady);
            this._views.updateMessage.$el.appendTo(this.$el);
            
            // social widgets
            if (this._environment.get('screenSize') !== 'small') {
                this._views.socialWidgets = new SocialWidgetsView().render();
                this._views.socialWidgets
                            .$el
                            .appendTo(this.$el.find('.social-widgets-anchor'));
            }

            return this;
        },

        show: function () {
            $.mobile.changePage('#' + this.attributes.id, {
                transition: 'none'
            });
            return this;
        },

        pageshow: function () {
            if (this._hasUpdate) {
                this._views.updateMessage.show();
            }
            
            if (this._drawingClient) {
                return;
            }

            fixContentGeometry(this.$el.find('[data-role="header"]'),
                               this.$el.find('[data-role="content"]'));
            
            this.trigger('canvasReady', this.$el.find('canvas'));
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

            this._$title
                .removeClass(removedClass)
                .addClass(addedClass)
                .attr('title', message);
            
            this._notificationManager.push(message);

            return this;
        },

        showMenu: function (event) {
            event.preventDefault();

            if (!this._views.menu) {
                this._views.menu = new MenuView({
                    el: $('<div></div>').prependTo(this.$el),
                    app: this._app
                })
                .on('open', this._drawerManager.off, this._drawerManager)
                .on('close', this._drawerManager.on, this._drawerManager)
                .render();
            }

            this._views.menu.show();
        },

        showQuickActions: function (event) {
            event.preventDefault();

            if (!this._views.quickActions) {
                this._views.quickActions = new QuickActionsView({
                    el: $('<div></div>').appendTo(this.$el),
                    app: this._app,
                    collection: this._environment.get('actions'),
                    positionTo: event.target
                })
                .on('open', this._drawerManager.off, this._drawerManager)
                .on('close', this._drawerManager.on, this._drawerManager)
                .render();
            }

            this._views.quickActions.show();
        },
        
        isVisible: function () {
            if ($.mobile) {
                return $.mobile.activePage[0] === this.$el[0];
            }
            return false;
        },
        
        onInviteRequest: function (nickname) {
            var inviteView = this._views.inviteMessage,
                drawingClient = this._drawingClient;
            
            inviteView.text(sprintf(mainResources.inviteRequest,
                                    nickname));
            
            inviteView.once('ok', function () {
                drawingClient.sendResponse(nickname, true);
                inviteView.off('cancel');
                inviteView.hide();
            });
            
            inviteView.once('cancel', function () {
                drawingClient.sendResponse(nickname, false);
                inviteView.off('ok');
                inviteView.hide();
            });
            
            inviteView.show();
        },
        
        onInviteRequestCanceled: function (nickname) {
            this._views.inviteMessage.off('ok')
                                     .off('cancel')
                                     .hide();
        },
        
        onCacheUpdate: function () {
            if (this.isVisible()) {
                this._views.updateMessage.show();
                return;
            }
            
            // we only set a flag because
            // the view is probably not ready.
            // The pageshow event will check this
            // flag.
            this._hasUpdate = true;
        }
    });
});
