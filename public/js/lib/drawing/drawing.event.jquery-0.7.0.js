/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (window, jQuery, drawing) {
    'use strict';

    (function (factory) {
        if (typeof(define) === 'function' && define['amd']) {
            define(['jquery', 'drawing'], factory);
        } else {
            factory(jQuery, drawing);
        }
    }(function ($, drawing) {
        var defaultOptions = {
                events: {
                    down: 'mousedown',
                    up: 'mouseup',
                    move: 'mousemove'
                }
            },

            getPosition = function (event, offset) {
                return {
                    x: event.pageX - offset.left,
                    y: event.pageY - offset.top
                };
            };
            
        $.extend(drawing.canvasDrawer.fn, {
            eventShapeDrawer: function (options) {
                var _this = this,
                    opts = $.extend({}, defaultOptions, options),
                    $canvas = $(_this.context().canvas),
                    $body = $('body'),
                    onDrawnHandlers = [],
                    handlers = {
                        down: null,
                        up: null,
                        move: null
                    },
                    
                triggerOnDrawnEvent = function (shape) {
                    var i, len;
                    
                    for (i = 0, len = onDrawnHandlers.length; i < len; i++) {
                        onDrawnHandlers[i](shape);
                    }
                };
            
                return {
                    on: function (shapeName) {
                        var shapeDrawer = _this.shapeDrawer(shapeName);
                            
                        $canvas.off(opts.events.down, handlers.down);
                
                        handlers.down = function (event) {
                            var offset = $canvas.offset();
                            
                            event.preventDefault();
                            shapeDrawer.begin(getPosition(event, offset));
                            
                            handlers.move = function (event) {
                                event.preventDefault();
                                shapeDrawer.draw(getPosition(event, offset));
                            };
                            
                            handlers.up = function (event) {
                                var shape = shapeDrawer.end();
                                
                                event.preventDefault();
                                $canvas.off(opts.events.move, handlers.move);
                                $body.off(opts.events.up, handlers.up);
                                triggerOnDrawnEvent(shape);
                            };
                            
                            $body.on(opts.events.up, handlers.up);
                            $canvas.on(opts.events.move, handlers.move);
                        };
                    
                        $canvas.on(opts.events.down, handlers.down);
                    },

                    off: function () {
                        $canvas.off(opts.events.down, handlers.down)
                               .off(opts.events.move, handlers.move);
                        $body.off(opts.events.up, handlers.up);
                    },

                    addDrawnHandler: function (handler) {
                        if (handler && typeof handler === 'function') {
                            onDrawnHandlers.push(handler);
                        }
                    },

                    removeDrawnHandler: function (handler) {
                        var i, len;
                    
                        for (i = 0, len = onDrawnHandlers.length; i < len; i++) {
                            if (onDrawnHandlers[i] === handler) {
                                onDrawnHandlers.splite(i, 1);
                                break;
                            }
                        }
                    }
                };
            }
        });
    }));
}(window, window['jQuery'], window['drawing']));
