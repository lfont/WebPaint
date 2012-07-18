/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function ($, drawing) {
    "use strict";
    var defaultOptions = {
            events: {
                down: "mousedown",
                up: "mouseup",
                move: "mousemove"
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
                var opts = $.extend({}, defaultOptions, options),
                    that = this,
                    $canvas = $(that.canvas()),
                    $body = $("body"),
                    onDrawnCallback = [],
                    handlers = {
                        down: null,
                        up: null,
                        move: null
                    },
                    
                triggerOnDrawnEvent = function (shape) {
                    var i, len;
                    
                    for (i = 0, len = onDrawnCallback.length; i < len; i++) {
                        onDrawnCallback[i](shape);
                    }
                };
            
                return {
                    draw: function (kind) {
                        var shapeDrawer = that.shapeDrawer(kind);
                            
                        $canvas.unbind(opts.events.down, handlers.down);
                
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
                                $canvas.unbind(opts.events.move, handlers.move);
                                $body.unbind(opts.events.up, handlers.up);
                                triggerOnDrawnEvent(shape);
                            };
                            
                            $body.bind(opts.events.up, handlers.up);
                            $canvas.bind(opts.events.move, handlers.move);
                        };
                    
                        $canvas.bind(opts.events.down, handlers.down);
                    },
                    onDrawn: function (callback) {
                        if (callback && typeof callback === "function") {
                            onDrawnCallback.push(callback);
                        }
                    }
                };
            }
        });
}(window.jQuery, window.drawing));
