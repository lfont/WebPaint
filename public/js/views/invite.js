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

        initialize: function () {
            this._app = this.options.app;
            
            this._views = {};
            this._guests = this._app.guests;
            this._user = this._app.user;
            this._drawingClient = this._app.drawingClient;
            this._$inviteList = null;
            this._$inviteInformation = null;
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: inviteResources
                }))
                .attr('id', 'invite-view')
                .attr('data-role', 'dialog');

            this._$inviteList = this.$el.find('[data-role="listview"]');
            this._$inviteInformation = this.$el.find('.invite-information');
            
            this.$el.page();
            
            this.listenTo(this._guests, 'change reset', this.setGuests);
            this.setGuests(this._guests);

            this.listenTo(this._user, 'change:nickname', this.setUser);
            this.setUser(this._user, this._user.get('nickname'));

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
            var _this = this;
            
            this.$el.dialog('close');
            
            // wait for the popup to close before sending the invitation so
            // the main view is visible.
            this.$el.one('pagehide', function () {
                _this._drawingClient.sendInvite(guest.get('nickname'));
            });
        },

        setGuests: function (guests) {
            this._views = {};
            
            guests.each(function (guest, index) {
                var inviteItemView = this._views[index] = new InviteItemView({
                    model: guest
                })
                .on('selected', this.setGuest, this)
                .render();
                
                guests.once('change reset', inviteItemView.remove, inviteItemView);
                inviteItemView.$el.appendTo(this._$inviteList);
            }, this);

            this._$inviteList.listview('refresh');
        },

        setUser: function (user, nickname) {
            this._$inviteInformation
                .text(sprintf(inviteResources.inviteInformation, nickname));
        }
    });
});
