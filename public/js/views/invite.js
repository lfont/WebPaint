/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'collections/users',
    'text!/templates/list-wrapper.html',
    'text!/templates/invite.html',
    'i18n!nls/invite-view'
], function ($, mobile, Backbone, _, usersCollection, listWrapperTemplate,
             inviteTemplate, inviteResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagecreate': 'pagecreate',
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide',
            'vclick .user': 'userSelected'
        },

        template: _.template(listWrapperTemplate),
        
        listTemplate: _.template(inviteTemplate),

        render: function () {
            this.$el.html(this.template({
                        r: inviteResources
                    }))
                    .attr('data-url', 'invite')
                    .attr('data-role', 'dialog')
                    .page();

            usersCollection.on(
                'change reset',
                _.bind(this.refreshUsers, this));

            return this;
        },

        show: function () {
            mobile.changePage(this.$el);
        },

        pagecreate: function () {
            this.refreshUsers();
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        userSelected: function (event) {
            var $this = $(event.target),
                nickname = $this.attr('data-value');

            event.preventDefault();

            this.$el.dialog('close');
            
            // We set a little timeout because we need to be sure that the
            // mainView is visible.
            setTimeout(_.bind(this.options.socket.invite,
                              this.options.socket,
                              nickname),
                        250);
        },

        refreshUsers: function () {
            this.$el.find('.list-wrapper')
                    .html(this.listTemplate({
                        r: inviteResources,
                        users: usersCollection.toJSON()
                    }))
                    .trigger('create');

            return this;
        }
    });
});
