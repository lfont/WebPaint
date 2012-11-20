/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'environment',
    'drawer-manager',
    'socket-manager',
    'models/settings',
    'models/user',
    'text!/templates/main.html',
    'i18n!nls/main-view'
], function (require, $, mobile, Backbone, _, environment, DrawerManager,
             SocketManager, settingsModel, UserModel, mainTemplate,
             mainResources) {
    'use strict';

    var fixContentGeometry = function ($header, $content) {
            var contentHeight;

            contentHeight = $(window).height() - $header.outerHeight() -
                            ($content.outerHeight() - $content.height());

            $content.height(contentHeight);
        },

        fixCanvasGeometry = function ($content, $canvas) {
            var canvas = $canvas[0];

            canvas.height = $content.height() -
                            ($canvas.outerHeight() - $canvas.height()) -
                            4; // FIX: we should not set this manually
            canvas.width = $content.width() -
                           ($canvas.outerWidth() - $canvas.width());
        },

        createSocketManager = function (mainView) {
            var socket = new SocketManager(),
                user = new UserModel({
                    // TODO: allow the user to set a nickname
                    nickname: Math.floor(Math.random() * (1000 - 1)) + ""
                });

            mainView.user = user;
            socket.on("connected", function () {
                        mainView.showNetworkStatus(true);
                  })
                  .on("invite", function (user) {
                        mainView.$invitePendingPopup
                                .find(".message")
                                // TODO: Format the message cleanly.
                                .text(mainResources.invitePending +
                                      user.get("nickname"))
                                .end()
                                .popup("open");
                  })
                  .on("invite-response", function (response) {
                        mainView.$invitePendingPopup
                                .find(".message")
                                .text(response.accepted ?
                                      mainResources.inviteAccepted :
                                      mainResources.inviteRejected);

                        setTimeout(function () {
                            mainView.$invitePendingPopup.popup("close");
                        }, 2000);
                  })
                  .on("invite-request", function (user) {
                        // TODO: manage a request queue.
                        mainView.$inviteRequestPopup.find(".message")
                                // TODO: Format the message cleanly.
                                .text(mainResources.inviteRequest +
                                      user.get("nickname"))
                                .end()
                                .find(".accept, .reject")
                                .attr("data-value", user.get("nickname"))
                                .end()
                                .popup("open");
                  })
                  .connect(user);

            return socket;
        };

    return Backbone.View.extend({
        events: {
            "pageshow": "pageshow",
            "vclick .undo": "undo",
            "vclick .redo": "redo",
            "vclick .tools": "showTools",
            "vclick .options": "showOptions",
            "vclick .accept": "accept",
            "vclick .reject": "reject"
        },

        template: _.template(mainTemplate),

        render: function () {
            var appInfo = environment.getAppInfo();

            this.$el.html(this.template({
                        r: mainResources,
                        name: appInfo.name
                    }))
                    .addClass('main-view')
                    // The data-url attribute must be set for popups
                    .attr('data-url', '/')
                    .page();

            // TODO: create dedicated views
            this.$networkStatusTooltip = this.$el.find('.networkStatusTooltip');
            this.$inviteRequestPopup = this.$el.find('.inviteRequestPopup');
            this.$invitePendingPopup = this.$el.find('.invitePendingPopup');

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pageshow: function () {
            var $header, $content, $canvas;

            if (this.drawer) {
                return;
            }
         
            $header = this.$el.find("[data-role='header']");
            $content = this.$el.find("[data-role='content']");
            $canvas = this.$el.find("canvas");

            fixContentGeometry($header, $content);
            fixCanvasGeometry($content, $canvas);

            this.socket = createSocketManager(this);
            this.drawer = new DrawerManager($canvas[0], this.socket);

            $(window).on('online', _.bind(this.showNetworkStatus, this, true))
                     .on('offline', _.bind(this.showNetworkStatus, this, false));

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
            var $this = this.$el.find(".accept"),
                nickname = $this.attr("data-value");

            event.preventDefault();
            this.socket.acceptInvite(nickname);
            this.$inviteRequest.popup('close');
        },

        reject: function (event) {
            var $this = this.$el.find(".reject"),
                nickname = $this.attr("data-value");

            event.preventDefault();
            this.socket.rejectInvite(nickname);
            this.$inviteRequest.popup('close');
        },

        isVisible: function () {
            return mobile.activePage === this.$el;
        },

        showNetworkStatus: function (isOnline) {
            var _this = this,
                removedClass, addedClass, message;

            if (!this.isVisible()) {
                return;
            }

            if (isOnline) {
                removedClass = "title-offline";
                addedClass = "title-online";
                // TODO: Format the message cleanly.
                message = mainResources.onlineMessage +
                          this.user.get("nickname");
            } else {
                removedClass = "title-online";
                addedClass = "title-offline";
                message = mainResources.offlineMessage;
            }

            this.$el.find(".title")
                    .removeClass(removedClass)
                    .addClass(addedClass);

            this.$networkStatusTooltip.find(".message")
                                      .text(message)
                                      .end()
                                      .popup("open", {
                                        x: 0,
                                        y: 82
                                      });

             window.setTimeout(function () {
                _this.$networkStatusTooltip.popup('close');
             }, 2000);

             return this;
        },

        showTools: function (event) {
            var _this = this;

            event.preventDefault();

            require([
                'views/tools'
            ], function (ToolsView) {
                var UIInfo = environment.getUIInfo(),
                    isPopup = UIInfo.toolsViewType === 'popup';

                if (!_this.toolsView) {
                    _this.toolsView = new ToolsView({
                        el: isPopup ?
                            $('<div></div>').appendTo(_this.$el) :
                            $('<div></div>').appendTo('body'),
                        positionTo: isPopup ?
                            event.target :
                            null,
                        drawer: _this.drawer
                    });
                    _this.toolsView.on('open', _.bind(_this.drawer.off, _this.drawer));
                    _this.toolsView.on('close', _.bind(_this.drawer.on, _this.drawer));
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
                        drawer: _this.drawer,
                        socket: _this.socket
                    });
                    _this.optionsView.on('open', _.bind(_this.drawer.off, _this.drawer));
                    _this.optionsView.on('close', _.bind(_this.drawer.on, _this.drawer));
                    _this.optionsView.render();
                }

                _this.optionsView.show();
            });
        }
    });
});
