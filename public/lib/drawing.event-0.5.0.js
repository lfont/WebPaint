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
                    canvasDrawer = this,
                    canvas = $(canvasDrawer.canvas()),
                    body = $("body"),
                    handlers = {
                        down: null,
                        up: null,
                        move: null
                    };
            
                return {
                    draw: function (kind) {
                        var shapeDrawer = canvasDrawer.shapeDrawer(kind);
                            
                        canvas.unbind(opts.events.down, handlers.down);
                
                        handlers.down = function (event) {
                            var offset = canvas.offset();
                            
                            shapeDrawer.begin(getPosition(event, offset));
                            
                            handlers.move = function (event) {
                                event.preventDefault();
                                shapeDrawer.update(getPosition(event, offset));
                            };
                            
                            handlers.up = function () {
                                shapeDrawer.end();
                                canvas.unbind(opts.events.move, handlers.move);
                                body.unbind(opts.events.up, handlers.up);
                            };
                            
                            body.bind(opts.events.up, handlers.up);
                            canvas.bind(opts.events.move, handlers.move);
                        };
                    
                        canvas.bind(opts.events.down, handlers.down);
                    }
                };
            }
        });
}(window.jQuery, window.drawing));
