/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "jquery",
    "backbone",
    "underscore",
    "collections/users",
    "text!templates/invite.html",
    "text!templates/userList.html",
    "i18n!views/nls/invite"
], function ($, Backbone, _, usersCollection, inviteTemplate,
             userListTemplate, inviteResources) {
    "use strict";

    return Backbone.View.extend({
        events: {
            "pagebeforecreate": "pagebeforecreate",
            "pagecreate": "pagecreate",
            "pagebeforeshow": "pagebeforeshow",
            "pagehide": "pagehide",
            "vclick .user": "userSelected"
        },

        template: _.template(inviteTemplate),
        
        listTemplate: _.template(userListTemplate),

        render: function () {
            this.$el.html(this.template({
                r: inviteResources
            }));

            return this;
        },

        initialize: function () {
            usersCollection.on(
                "change reset",
                _.bind(this.refreshUsers, this));
        },

        pagebeforecreate: function () {
            this.render();
        },

        pagecreate: function () {
            this.refreshUsers();
        },

        pagebeforeshow: function () {
            this.trigger("open");
        },

        pagehide: function () {
            this.trigger("close");
        },

        userSelected: function (event) {
            var $this = $(event.target),
                nickname = $this.attr("data-value");

            event.preventDefault();

            $.mobile.changePage("#main", { reverse: true });
            
            // We set a little timeout because we need to be sure that the
            // mainView is visible.
            setTimeout(_.bind(this.options.socket.invite,
                              this.options.socket,
                              nickname),
                        250);
        },

        refreshUsers: function () {
            this.$el.find(".user-list")
                    .html(this.listTemplate({
                        r: inviteResources,
                        users: usersCollection.toJSON()
                    }))
                    .trigger("create");

            return this;
        }
    });
});
