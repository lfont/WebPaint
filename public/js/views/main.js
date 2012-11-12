/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
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
], function ($, Backbone, _, environment, DrawerManager, SocketManager,
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
                        var $popup = $("#invitePending");

                        $popup.find(".message")
                              // TODO: Format the message cleanly.
                              .text(mainResources.invitePending +
                                    user.get("nickname"))
                              .end()
                              .popup("open");
                  })
                  .on("invite-response", function (response) {
                        var $popup = $("#invitePending");

                        $popup.find(".message")
                              .text(response.accepted ?
                                    mainResources.inviteAccepted :
                                    mainResources.inviteRejected);

                        setTimeout(function () {
                            $popup.popup("close");
                        }, 2000);
                  })
                  .on("invite-request", function (user) {
                        var $popup = $("#inviteRequest");

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
            "pagebeforecreate": "pagebeforecreate",
            "pageshow": "pageshow",
            "vclick .undo": "undo",
            "vclick .redo": "redo",
            "vclick .accept": "accept",
            "vclick .reject": "reject"
        },

        template: _.template(mainTemplate),

        render: function () {
            var appInfo = environment.getAppInfo(),
                UIInfo = environment.getUIInfo();
            
            this.toolsViewId = UIInfo.toolsViewType === 'popup' ?
                '#toolsPopup' :
                '#toolsDialog';
            
            this.$el.html(this.template({
                r: mainResources,
                name: appInfo.name,
                toolsView: {
                    id: this.toolsViewId,
                    type: UIInfo.toolsViewType
                }
            }));

            return this;
        },
        
        initialize: function () {
            var UIInfo = environment.getUIInfo();
            
            $(document).on("mobileinit", function () {
                $.mobile.defaultPageTransition =
                    $.mobile.defaultDialogTransition =
                        UIInfo.defaultTransition;
            });
        },

        pagebeforecreate: function () {
            var $window = $(window);
            
            this.render();

            $window.on("online", _.bind(this.showNetworkStatus, this, true));
            $window.on("offline", _.bind(this.showNetworkStatus, this, false));
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
            this.drawer = new DrawerManager(this.$el.find("canvas")[0],
                                            this.socket);

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
            $("#inviteRequest").popup("close");
        },

        reject: function (event) {
            var $this = this.$el.find(".reject"),
                nickname = $this.attr("data-value");

            event.preventDefault();
            this.socket.rejectInvite(nickname);
            $("#inviteRequest").popup("close");
        },

        isVisible: function () {
            return $.mobile.activePage.attr("id") === this.$el.attr("id");
        },

        showNetworkStatus: function (isOnline) {
            var $networkStatusTooltip, removedClass, addedClass, message;

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

            $networkStatusTooltip = $("#networkStatusTooltip");
            $networkStatusTooltip.find(".message")
                                 .text(message)
                                 .end()
                                 .popup("open", {
                                    x: 0,
                                    y: 82
                                });

             window.setTimeout(function () {
                $networkStatusTooltip.popup("close");
             }, 2000);

             return this;
        },

        unload: function () {
            this.drawer.unload();
            return this;
        }
    });
});
