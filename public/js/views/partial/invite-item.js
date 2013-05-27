/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'backbone',
    'underscore',
    'text!templates/partial/invite-item.html'
], function (Backbone, _, inviteItemTemplate) {
    'use strict';

    var InviteItemView = Backbone.View.extend({
        events: {
            'vclick': 'guestClick'
        },

        tagName: 'li',
        
        template: _.template(inviteItemTemplate),

        render: function () {
            this.$el
                .html(this.template({
                    guest: this.model.toJSON()
                }));
            
            return this;
        },

        guestClick: function (event) {
            event.preventDefault();
            this.trigger('selected', this.model);
        }
    });

    return InviteItemView;
});
