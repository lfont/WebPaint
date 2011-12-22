/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (drawing, $) {
    'use strict';
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
        },
        canvasDrawerEventWrapperBuilder = function (canvasDrawer, options) {
            var opts = $.extend({}, defaultOptions, options),
                body = $('body'),
                canvas = $(canvasDrawer.canvas()),
                handlers = {
                    down: null,
                    up: null,
                    move: null
                };
            
            if (typeof(canvasDrawer.eventShapeDrawer) === 'function') {
                throw new Error('Cannot attach the eventShapeDrawer ' +
                        'function because a function of the same name ' +
                        'already exists!');
            }
            
            canvasDrawer.eventShapeDrawer = function (kind) {
                var shapeDrawer = this.shapeDrawer(kind),
                    offset = canvas.offset();
            
                canvas.unbind(opts.events.down, handlers.down);
                body.unbind(opts.events.up, handlers.up);
        
                handlers.down = function (event) {
                    shapeDrawer.begin(getPosition(event, offset));
                    
                    handlers.move = function (event) {
                        shapeDrawer.update(getPosition(event, offset));
                    };
                    
                    handlers.up = function () {
                        shapeDrawer.end();
                        canvas.unbind(opts.events.move, handlers.move);
                    };
                    
                    body.bind(opts.events.up, handlers.up);
                    canvas.bind(opts.events.move, handlers.move);
                };
            
                canvas.bind(opts.events.down, handlers.down);
            };
            
            return canvasDrawer;
        };
    
    if (typeof(drawing.canvasDrawerEventWrapper) !== 'function') {
        drawing.canvasDrawerEventWrapper = canvasDrawerEventWrapperBuilder;
    }
}(window.drawing, window.jQuery));
