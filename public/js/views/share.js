/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'text!templates/share.html',
    'i18n!nls/share-view'
], function ($, Backbone, _, shareTemplate, shareResources) {
    'use strict';

    function dataUrlToBlob(dataUrl) {
        var parts = dataUrl.split(';base64,'),
            contentType = parts[0].split(':')[1],
            raw = atob(parts[1]),
            rawLength = raw.length,
            uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([ uInt8Array ], { type: contentType });
    }

    return Backbone.View.extend({
        events: {
            'popupbeforeposition': 'popupbeforeposition',
            'popupafterclose': 'popupafterclose',
            'vclick .cancel': 'cancel',
            'vclick .share': 'share'
        },

        template: _.template(shareTemplate),

        render: function () {
            this.$el.html(this.template({
                r: shareResources
            })).attr('id', 'share-view')
               .attr('data-position-to', 'window')
               .attr('data-dismissible', 'false')
               .addClass('ui-corner-all')
               .trigger('create')
               .popup();

            return this;
        },

        show: function () {
            this.$el.find('.name')
                    .val('')
                    .end()
                    .find('.data')
                    .val(this.options.drawerManager.snapshot())
                    .end()
                    .popup('open');
        },

        popupbeforeposition: function () {
            this.trigger('open');
        },

        popupafterclose: function () {
            this.trigger('close');
        },

        cancel: function (event) {
            event.preventDefault();
            this.$el.popup('close');
        },

        share: function (event) {
            var _this = this,
                name = this.$el.find('.name').val(),
                data = this.$el.find('.data').val(),
                blob = dataUrlToBlob(data),
                activity;

            event.preventDefault();

            if (name === '') {
                name = shareResources.defaultFileName;
            }

            name += '.' + blob.type.substring(blob.type.indexOf('/') + 1);

            activity = new MozActivity({
                name: 'share',
                data: {
                  type: 'image/*',
                  number: 1,
                  blobs: [ blob ],
                  filenames: [ name ],
                  filepaths: [ name ]
                }
            });

            activity.onsuccess = function () {
                _this.$el.popup('close');
            };

            acivity.onerror = function () {
                console.log('The activity encouter en error: ' + this.error);
                _this.$el.popup('close');
            };
        }
    });
});
