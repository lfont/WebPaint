/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'text!templates/partial/history-item.html',
    'i18n!nls/history-item-view'
], function (require, historyItemTemplate, historyItemResources) {
    'use strict';

    var _        = require('underscore'),
        Backbone = require('backbone');
    
    var HistoryItemView = Backbone.View.extend({
        events: {
            'vclick': 'snapshotClick'
        },

        tagName: 'li',
        
        template: _.template(historyItemTemplate),

        initialize: function () {
            this._environment = this.options.environment;
        },
        
        render: function () {
            this.$el
                .html(this.template({
                    r: historyItemResources,
                    snapshot: this.model
                }));

            this._$marker = this.$el.find('.ui-li-count');

            this.listenTo(this._environment, 'change:cursor',
                          this.updateMarker);

            this.updateMarker(this._environment,
                              this._environment.get('cursor'));
            
            return this;
        },

        updateMarker: function (environment, cursor) {
            if (this.model.index === cursor) {
                this._$marker.show();
            } else {
                this._$marker.hide();
            }
        },

        snapshotClick: function (event) {
            event.preventDefault();
            this.trigger('selected', this.model);
        }
    });

    return HistoryItemView;
});
