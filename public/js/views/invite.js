/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'sprintf',
    'views/partial/invite-item',
    'text!templates/invite.html',
    'i18n!nls/invite-view'
], function ($, Backbone, _, sprintf, InviteItemView, inviteTemplate,
             inviteResources) {
    'use strict';

    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },
        
        template: _.template(inviteTemplate),

        render: function () {
            this.$el
                .html(this.template({
                    r: inviteResources
                }))
                .attr('id', 'invite-view')
                .attr('data-role', 'dialog')
                .page();

            this.$inviteList = this.$el.find('[data-role="listview"]');
            this.$inviteInformation = this.$el.find('.invite-information');
            
            var guests = this.options.environment.get('guests');
            this.listenTo(guests, 'change reset', this.setGuests);
            this.setGuests(guests);

            var user = this.options.environment.get('user');
            this.listenTo(user, 'change:nickname', this.setUser);
            this.setUser(user, user.get('nickname'));

            return this;
        },

        show: function () {
            $.mobile.navigate('#invite-view');
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        setGuest: function (guest) {
            this.$el.dialog('close');
            
            // We set a little timeout because we need to be sure that the
            // mainView is visible.
            setTimeout(this.options.drawingClient.sendInvite
                                                 .bind(this.options.drawingClient,
                                                       guest.get('nickname')), 250);
        },

        setGuests: function (guests) {
            guests.each(function (guest) {
                var inviteItemView = new InviteItemView({
                    environment: this.options.environment,
                    model: guest
                });

                inviteItemView.on('selected', this.setGuest, this);
                guests.once('change reset', inviteItemView.remove, inviteItemView);
                inviteItemView.render().$el.appendTo(this.$inviteList);
            }, this);

            this.$inviteList.listview('refresh');
        },

        setUser: function (user, nickname) {
            this.$inviteInformation
                .text(sprintf(inviteResources.inviteInformation, nickname));
        }
    });
});
