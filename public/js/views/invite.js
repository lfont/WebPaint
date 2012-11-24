/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile',
    'backbone',
    'underscore',
    'text!/templates/list-wrapper.html',
    'text!/templates/invite.html',
    'i18n!nls/invite-view'
], function ($, mobile, Backbone, _, listWrapperTemplate, inviteTemplate,
             inviteResources) {
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

            this.options.environment.get('users').on(
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
            setTimeout(this.options.socket.invite.bind(this.options.socket,
                                                       nickname), 250);
        },

        refreshUsers: function () {
            this.$el.find('.list-wrapper')
                    .html(this.listTemplate({
                        r: inviteResources,
                        users: this.options.environment.get('users').toJSON()
                    }))
                    .trigger('create');

            return this;
        }
    });
});
