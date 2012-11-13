/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "lib/jquery.mobile",
    "backbone",
    "underscore",
    "environment",
    "drawerManager",
    "socketManager",
    "models/settings",
    "models/user",
    "views/tools",
    "views/options",
    "text!/templates/main.html",
    "i18n!views/nls/main"
], function ($, mobile, Backbone, _, environment, DrawerManager, SocketManager,
             settingsModel, UserModel, ToolsView, OptionsView, mainTemplate,
             mainResources) {
    "use strict";

    var fixContentGeometry = function ($header, $content) {
            var contentHeight = $(window).height() - $header.outerHeight();

            contentHeight -= ($content.outerHeight() - $content.height());
            $content.height(contentHeight);
        },

        fixCanvasGeometry = function ($content, $canvas) {
            var canvas = $canvas[0];

            canvas.height = ($content.height() -
                ($canvas.outerHeight() - $canvas.height()));
            canvas.width = ($content.width() -
                ($canvas.outerWidth() - $canvas.width()));
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
                        var $popup = this.$invitePending;

                        $popup.find(".message")
                              // TODO: Format the message cleanly.
                              .text(mainResources.invitePending +
                                    user.get("nickname"))
                              .end()
                              .popup("open");
                  })
                  .on("invite-response", function (response) {
                        var $popup = this.$invitePending;

                        $popup.find(".message")
                              .text(response.accepted ?
                                    mainResources.inviteAccepted :
                                    mainResources.inviteRejected);

                        setTimeout(function () {
                            $popup.popup("close");
                        }, 2000);
                  })
                  .on("invite-request", function (user) {
                        var $popup = this.$inviteRequest;

                        // TODO: manage a request queue.
                        $popup.find(".message")
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
            "vclick .accept": "accept",
            "vclick .reject": "reject"
        },

        template: _.template(mainTemplate),

        initialize: function () {
            var UIInfo = environment.getUIInfo();

            this.toolsViewType = UIInfo.toolsViewType;
            this.toolsViewId = UIInfo.toolsViewType === 'popup' ?
                '#toolsPopup' :
                '#toolsDialog';
        },

        render: function () {
            var appInfo = environment.getAppInfo();

            this.$el.html(this.template({
                r: mainResources,
                name: appInfo.name,
                toolsView: {
                    id: this.toolsViewId,
                    type: this.toolsViewType
                }
            })).addClass('main-view')
               // The data-url attribute must be set for popups
               .attr('data-url', '/')
               .page();

            this.$networkStatusTooltip = this.$el.find('.networkStatusTooltip');
            this.$inviteRequest = this.$el.find('.inviteRequest');
            this.$invitePending = this.$el.find('.invitePending');

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

            this.toolsView = new ToolsView({
                el: $(this.toolsViewId),
                drawer: this.drawer
            });
            this.toolsView.on("open", _.bind(this.drawer.off, this.drawer));
            this.toolsView.on("close", _.bind(this.drawer.on, this.drawer));
            
            this.optionsView = new OptionsView({
                el: $("#options"),
                drawer: this.drawer,
                socket: this.socket
            });
            this.optionsView.on("open", _.bind(this.drawer.off, this.drawer));
            this.optionsView.on("close", _.bind(this.drawer.on, this.drawer));

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

        unload: function () {
            this.drawer.unload();
            return this;
        }
    });
});
