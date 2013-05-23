/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'drawing',
    'i18n!nls/drawer-manager',
    'drawing.event'
], function ($, Backbone, _, drawing, drawerManagerResources) {
    'use strict';

    function fixCanvasGeometry ($canvas) {
        var $container = $canvas.parent(),
            canvas = $canvas[0];

        canvas.height = $container.height() -
                        ($canvas.outerHeight() - $canvas.height());
        canvas.width = $container.width() -
                       ($canvas.outerWidth() - $canvas.width());
    }

    function restoreDrawer (drawer, environment) {
        var background = environment.get('background'),
            image;

        function setBackground(background) {
            drawer.newDrawing(background);
            drawer.properties({
                lineWidth: environment.get('lineWidth'),
                strokeStyle: environment.get('strokeStyle'),
                fillStyle: environment.get('fillStyle'),
                lineCap: environment.get('lineCap')
            });
        }

        if (background.match(/(?:^data:)|(?:\.(?:jpg|png)$)/)) {
            image = new Image();
            image.onload = function () {
                setBackground(image);
            };
            image.src = background;
        } else {
            setBackground(background);
        }
    }

    function showToast (message) {
        require(['jquery.mobile.toast'], function (toast) {
            toast(message);
        });
    }

    function Observable () {
        _.extend(this, Backbone.Events);

        this.value = null;

        this.set = function (value) {
            var previousValue = this.value;
            this.value = value;
            if (previousValue !== value) {
                this.trigger('set', value);
            }
        };
    }

    return function ($canvas, environment) {
        var drawer = drawing.canvasDrawer($canvas[0]),
            shapeDrawer = drawer.eventShapeDrawer({
                events: {
                    down: 'vmousedown',
                    up: 'vmouseup',
                    move: 'vmousemove'
                }
            });

        fixCanvasGeometry($canvas);
        restoreDrawer(drawer, environment);
        environment.set('snapshots', new Observable());

        this.draw = function (shape) {
            drawer.draw(shape);
        };

        this.addDrawnHandler = function (handler) {
            shapeDrawer.addDrawnHandler(handler);
        };

        this.undo = function () {
            if (!drawer.undo()) {
                showToast(drawerManagerResources.lastUndo);
            }

            return this;
        };

        this.redo = function () {
            if (!drawer.redo()) {
                showToast(drawerManagerResources.lastRedo);
            }

            return this;
        };

        this.on = function () {
            setTimeout(function () {
                shapeDrawer.on(environment.get('shape'));
            }, 250);

            return this;
        };

        this.off = function () {
            environment.set('cursor', drawer.cursor());
            environment.get('snapshots').set(drawer.snapshots());
            shapeDrawer.off();
            return this;
        };

        this.shape = function (name) {
            if (_.isString(name)) {
                environment.set({
                    shape: name
                });
            }

            return environment.get('shape');
        };

        this.color = function (hex) {
            var properties;

            if (_.isString(hex)) {
                properties = {
                    strokeStyle: hex,
                    fillStyle: hex
                };
                environment.set(properties);
                drawer.properties(properties);
            }

            return environment.get('strokeStyle');
        };

        this.lineWidth = function (value) {
            var properties;

            if (_.isNumber(value)) {
                properties = {
                    lineWidth: value
                };
                environment.set(properties);
                drawer.properties(properties);
            }

            return environment.get('lineWidth');
        };

        this.snapshot = function () {
            return drawer.snapshots()[drawer.cursor()];
        };

        this.cursor = function (index) {
            if (_.isNumber(index)) {
                drawer.cursor(index);
            }

            return drawer.cursor();
        };

        this.newDrawing = function (background) {
            var properties;

            environment.set({ cursor: null }, { silent: true });

            drawer.newDrawing(background);
            properties = drawer.properties();

            // FIX: restore the default settings
            environment.set({
                background: background,
                shape: 'pencil',
                lineWidth: properties.lineWidth,
                strokeStyle: properties.strokeStyle,
                fillStyle: properties.fillStyle,
                cursor: drawer.cursor()
            });

            environment.get('snapshots').set(drawer.snapshots());
        };

        this.clear = function () {
            drawer.clear().store();
        };
    };
});
