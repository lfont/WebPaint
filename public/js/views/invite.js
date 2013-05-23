/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'sprintf',
    'text!templates/list-wrapper.html',
    'text!templates/invite.html',
    'i18n!nls/invite-view'
], function ($, Backbone, _, sprintf, listWrapperTemplate,
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
            this.$el
                .html(this.template({
                    r: inviteResources
                }))
                .attr('id', 'invite-view')
                .attr('data-role', 'dialog')
                .page();

            this.options.environment.get('guests').on(
                'change reset',
                _.bind(this.refreshUsers, this));

            this.options.environment.get('user').on(
                'change:nickname',
                _.bind(this.refreshInformation, this));

            return this;
        },

        show: function () {
            $.mobile.navigate('#invite-view');
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
            var _this = this,
                $this = $(event.target),
                nickname = $this.attr('data-value');

            event.preventDefault();

            this.$el.dialog('close');
            
            // wait for the popup to close before sending the invitation so
            // the main view is visible.
            this.$el.one('pagehide', function () {
                _this.options.drawingClient.sendInvite(nickname);
            });
        },

        refreshUsers: function () {
            var guests = this.options.environment.get('guests').toJSON();

            this.$el
                .find('.list-wrapper')
                .html(this.listTemplate({
                    r: inviteResources,
                    guests: guests
                }))
                .trigger('create');

            this.refreshInformation();

            return this;
        },

        refreshInformation: function () {
            var user = this.options.environment.get('user'),
                nickname = user.get('nickname');

            this.$el.find('.invite-information')
                    .text(sprintf(inviteResources.inviteInformation, nickname));

            return this;
        }
    });
});
