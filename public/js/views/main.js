/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'jquery.mobile',
    'backbone',
    'underscore',
    'drawer-manager',
    'drawing-client',
    'sprintf',
    'text!templates/main.html',
    'i18n!nls/main-view'
], function (require, $, mobile, Backbone, _, DrawerManager, DrawingClient,
             sprintf, mainTemplate, mainResources) {
    'use strict';

    var fixContentGeometry = function ($header, $content) {
            var contentHeight;

            contentHeight = $(window).height() - $header.outerHeight() -
                            ($content.outerHeight() - $content.height());

            $content.height(contentHeight);
        };

    return Backbone.View.extend({
        events: {
            'pageshow': 'pageshow',
            'vclick .undo': 'undo',
            'vclick .redo': 'redo',
            'vclick .tools': 'showTools',
            'vclick .options': 'showOptions',
            'vclick .accept': 'accept',
            'vclick .reject': 'reject'
        },

        template: _.template(mainTemplate),

        render: function () {
            var _this = this;

            this.$el.html(this.template({
                        r: mainResources,
                        name: this.options.environment.get('appName')
                    }))
                    .attr('id', 'main-view')
                    .addClass('main-view')
                    // The data-url attribute must be set for popups
                    .attr('data-url', '/')
                    .page();

            this.$messageTooltip = this.$el.find('.messageTooltip');
            this.$inviteRequestPopup = this.$el.find('.inviteRequestPopup');
            this.$invitePendingPopup = this.$el.find('.invitePendingPopup');

            if (this.options.environment.get('screenSize') !== 'small') {
                require([
                    'views/social-widgets'
                ], function (SocialWidgetsView) {
                    var socialWidgetsView = new SocialWidgetsView({
                        el: _this.$el.find('.social-widgets')
                    }).render();
                });
            }

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
            return this;
        },

        pageshow: function () {
            var _this = this;

            if (this.drawer) {
                return;
            }

            fixContentGeometry(this.$el.find('[data-role="header"]'),
                               this.$el.find('[data-role="content"]'));

            this.drawer = new DrawerManager(this.$el.find('canvas'),
                                            this.options.environment);

            this.socket = new DrawingClient(this.drawer,
                                            this.options.environment);
            this.socket.on('message', this.showMessage.bind(this))
                       .on('inviteGuestRequest', this.showInvitePending.bind(this))
                       .on('inviteRequest', this.showInviteRequest.bind(this))
                       .on('inviteResponse', this.showInviteResponse.bind(this))
                       .on('inviteRequestCanceled', function () {
                            _this.$inviteRequestPopup.popup('close');
                       });

            $(window).on('online', this.showNetworkStatus.bind(this, true))
                     .on('offline', this.showNetworkStatus.bind(this, false));

            this.showNetworkStatus(navigator.onLine);

            this.drawer.on();
        },

        undo: function (event) {
            event.preventDefault();
            this.drawer.undo();
        },

        redo: function (event) {
            event.preventDefault();
            this.drawer.redo();
        },

        accept: function (event) {
            var $this = this.$el.find('.accept'),
                nickname = $this.attr('data-value');

            event.preventDefault();
            this.socket.sendResponse(nickname, true);
            this.$inviteRequestPopup.popup('close');
        },

        reject: function (event) {
            var $this = this.$el.find('.reject'),
                nickname = $this.attr('data-value');

            event.preventDefault();
            this.socket.sendResponse(nickname, false);
            this.$inviteRequestPopup.popup('close');
        },

        isVisible: function () {
            return mobile.activePage[0] === this.$el[0];
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

             return this;
        },

        showMessage: function (text) {
            var _this = this;

            // TODO: a message queue can be useful to
            // display all messages
            this.$messageTooltip
                .find('.text')
                .text(text)
                .end()
                .popup('open', {
                    x: 0,
                    y: 82
                });

            setTimeout(function () {
                _this.$messageTooltip.popup('close');
            }, 2000);

            return this;
        },

        showInviteRequest: function (nickname) {
            var _this = this;

            this.$inviteRequestPopup.find('.message')
                .text(sprintf(mainResources.inviteRequest, nickname))
                .end()
                .find('.accept, .reject')
                .attr('data-value', nickname)
                .end()
                .popup('open');

            return this;
        },

        showInvitePending: function (nickname) {
            this.$invitePendingPopup
                .find('.message')
                .text(sprintf(mainResources.invitePending, nickname))
                .end()
                .popup('open');

            return this;
        },

        showInviteResponse: function (nickname, status) {
            var _this = this,
                message = mainResources.inviteBusy;

            if (status === 'accepted') {
                message = mainResources.inviteAccepted;
            } else if (status === 'rejected') {
                message = mainResources.inviteRejected;
            }

            this.$invitePendingPopup
                .find('.message')
                .text(sprintf(message, nickname));

            setTimeout(function () {
                _this.$invitePendingPopup.popup('close');
            }, 2000);

            return this;
        },

        showTools: function (event) {
            var _this = this;
            event.preventDefault();

            require([
                'views/tools'
            ], function (ToolsView) {
                var isPopup = _this.options.environment.get('screenSize') !==
                             'small';

                if (!_this.toolsView) {
                    _this.toolsView = new ToolsView({
                        el: isPopup ?
                            $('<div></div>').appendTo(_this.$el) :
                            $('<div></div>').appendTo('body'),
                        positionTo: isPopup ?
                            event.target :
                            null,
                        environment: _this.options.environment,
                        drawer: _this.drawer
                    });
                    _this.toolsView.on('open', _this.drawer.off.bind(_this.drawer));
                    _this.toolsView.on('close', _this.drawer.on.bind(_this.drawer));
                    _this.toolsView.render();
                }

                _this.toolsView.show();
            });
        },

        showOptions: function (event) {
            var _this = this;
            event.preventDefault();

            require([
                'views/options'
            ], function (OptionsView) {
                if (!_this.optionsView) {
                    _this.optionsView = new OptionsView({
                        el: $('<div></div>').appendTo(_this.$el),
                        positionTo: event.target,
                        environment: _this.options.environment,
                        drawer: _this.drawer,
                        socket: _this.socket
                    });
                    _this.optionsView.on('open', _this.drawer.off.bind(_this.drawer));
                    _this.optionsView.on('close', _this.drawer.on.bind(_this.drawer));
                    _this.optionsView.render();
                }

                _this.optionsView.show();
            });
        }
    });
});
