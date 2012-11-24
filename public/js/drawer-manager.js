/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'jquery',
    'backbone',
    'underscore',
    'drawing',
    'models/settings',
    'i18n!nls/drawer-manager',
    'lib/drawing.event',
    'lib/jquery.mobile.toast'
], function ($, Backbone, _, drawing, settingsModel, drawerManagerResources) {
    'use strict';

    var fixCanvasGeometry = function ($canvas) {
            var $container = $canvas.parent(),
                canvas = $canvas[0];

            canvas.height = $container.height() -
                            ($canvas.outerHeight() - $canvas.height()) -
                            4; // FIX: we should not set this manually
            canvas.width = $container.width() -
                           ($canvas.outerWidth() - $canvas.width());
        },

        restoreDrawer = function (drawer) {
            var background = settingsModel.get('background'),
                image;

            function setBackground(background) {
                drawer.newDrawing(background);
                drawer.properties({
                    lineWidth: settingsModel.get('lineWidth'),
                    strokeStyle: settingsModel.get('strokeStyle'),
                    fillStyle: settingsModel.get('fillStyle'),
                    lineCap: settingsModel.get('lineCap')
                });
            }

            if (background.match(/(?:^data:)|(?:\.(?:jpg|png)$)/)) {
                image = new window.Image();
                image.onload = function () {
                    setBackground(image);
                };
                image.src = background;
            } else {
                setBackground(background);
            }
        },

        bindSocketHandler = function (socket, drawer, shapeDrawer) {
            socket.on('invite-response', function (response) {
                if (!response.accepted) {
                    return;
                }
                
                shapeDrawer.addDrawnHandler(function (shape) {
                    socket.draw({
                        to: response.sender,
                        shape: shape
                    });
                });
            });

            socket.on('invite-accepted', function (fromUser) {
                shapeDrawer.addDrawnHandler(function (shape) {
                    socket.draw({
                        to: fromUser,
                        shape: shape
                    });
                });
            });

            socket.on('draw', function (data) {
                drawer.draw(data.shape);
            });
        };

    return function ($canvas, socket) {
        var drawer = drawing.canvasDrawer($canvas[0]),
            shapeDrawer = drawer.eventShapeDrawer({
                events: {
                    down: 'vmousedown',
                    up: 'vmouseup',
                    move: 'vmousemove'
                }
            });

        fixCanvasGeometry($canvas);
        restoreDrawer(drawer);
        bindSocketHandler(socket, drawer, shapeDrawer);

        this.undo = function () {
            if (!drawer.undo()) {
                $.mobile.showToast(drawerManagerResources.lastUndo);
            }

            return this;
        };

        this.redo = function () {
            if (!drawer.redo()) {
                $.mobile.showToast(drawerManagerResources.lastRedo);
            }

            return this;
        };

        this.on = function () {
            window.setTimeout(function () {
                shapeDrawer.on(settingsModel.get('shape'));
            }, 250);

            return this;
        };

        this.off = function () {
            settingsModel.set({
                histories: drawer.snapshots(),
                history: drawer.cursor()
            });

            shapeDrawer.off();

            return this;
        };

        this.shape = function (name) {
            if (_.isString(name)) {
                settingsModel.set({
                    shape: name
                });
            }

            return settingsModel.get('shape');
        };

        this.color = function (hex) {
            var properties;

            if (_.isString(hex)) {
                properties = {
                    strokeStyle: hex,
                    fillStyle: hex
                };
                settingsModel.set(properties);
                drawer.properties(properties);
            }

            return settingsModel.get('strokeStyle');
        };

        this.lineWidth = function (value) {
            var properties;

            if (_.isNumber(value)) {
                properties = {
                    lineWidth: value
                };
                settingsModel.set(properties);
                drawer.properties(properties);
            }

            return settingsModel.get('lineWidth');
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

            settingsModel.set({
                histories: null,
                history: null
            }, { silent: true });

            drawer.newDrawing(background);
            properties = drawer.properties();

            // FIX: restore the default settings
            settingsModel.set({
                background: background,
                shape: 'pencil',
                lineWidth: properties.lineWidth,
                strokeStyle: properties.strokeStyle,
                fillStyle: properties.fillStyle,
                histories: drawer.snapshots(),
                history: drawer.cursor()
            });
        };

        this.clear = function () {
            drawer.clear().store();
        };
    };
});