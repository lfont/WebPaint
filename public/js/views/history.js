/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'views/partial/history-item',
    'text!templates/history.html',
    'i18n!nls/history-view'
], function (require, HistoryItemView, historyTemplate, historyResources) {
    'use strict';

    var $        = require('jquery'),
        _        = require('underscore'),
        Backbone = require('backbone');
    
    return Backbone.View.extend({
        events: {
            'pagebeforeshow': 'pagebeforeshow',
            'pagehide': 'pagehide'
        },

        template: _.template(historyTemplate),
        
        initialize: function () {
            this._app = this.options.app;
            
            this._views = {};
            this._environment = this._app.environment;
            this._drawerManager = this._app.drawerManager;
            this._$historyList = null;
        },

        render: function () {
            this.$el
                .html(this.template({
                    r: historyResources
                }))
                .attr('id', 'history-view')
                .attr('data-role', 'dialog')
                .page();

            this._$historyList = this.$el.find('[data-role="listview"]');

            this.snapshots = this._environment.get('snapshots');
            this.listenTo(this.snapshots, 'set', this.setSnapshots);
            this.setSnapshots(this.snapshots.value);

            return this;
        },

        show: function () {
            $.mobile.navigate('#history-view');
        },

        pagebeforeshow: function () {
            this.trigger('open');
        },

        pagehide: function () {
            this.trigger('close');
        },

        setSnapshot: function (snapshot) {
            this._drawerManager.cursor(snapshot.index);
            this.$el.dialog('close');
        },

        setSnapshots: function (imageDataURLs) {
            this._views = {};
            
            _.each(imageDataURLs, function (imageDataURL, index) {
                var historyItemView = this._views[index] = new HistoryItemView({
                    environment: this._environment,
                    model: {
                        index: index,
                        imageDataURL: imageDataURL
                    }
                })
                .on('selected', this.setSnapshot, this)
                .render();
                
                this.snapshots.once('set', historyItemView.remove, historyItemView);
                historyItemView.$el.prependTo(this._$historyList);
            }, this);

            this._$historyList.listview('refresh');
        }
    });
});
