/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function () {
    'use strict';
    var $ = window.jQuery,
        defaultOptions = {
            historicSize: 10
        },
        restoreContextImage = function (context, imageDataURL) {
            var image = new Image();
            
            image.onload = function () {
                context.drawImage(image, 0, 0);
            };
            image.src = imageDataURL;
        },
        getContextProperties = function (context) {
            return {
                strokeStyle: context.strokeStyle,
                fillStyle: context.fillStyle,
                lineWidth: context.lineWidth,
                lineCap: context.lineCap
            };
        },
        setContextProperties = function (context, properties) {
            if (properties.strokeStyle !== 'undefined') {
                context.strokeStyle = properties.strokeStyle;
            }
            
            if (properties.fillStyle !== 'undefined') {
                context.fillStyle = properties.fillStyle;
            }
            
            if (properties.lineWidth !== 'undefined') {
                context.lineWidth = properties.lineWidth;
            }
            
            if (properties.lineCap !== 'undefined') {
                context.lineCap = properties.lineCap;
            }
        },
        drawCanvasBackground = function (canvas, context, color) {
            var fillStyle = context.fillStyle;

            context.fillStyle = color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = fillStyle;
        },
        clearCanvas = function (canvas, context, backgroundColor) {
            canvas.width = canvas.width;
            drawCanvasBackground(canvas, context, backgroundColor);
        },
        // canvasBuilder
        shapeDrawer = function (kind) {
            return window.drawing.shapeDrawer(this, kind);
        },
        undo = function () {
            var history = this.history();
            
            if (history > 0) {
                this.history(history - 1);
            }
        },
        redo = function () {
            var history = this.history();
            
            if (history + 1 < this.histories().length) {
                this.history(history + 1);
            }
        },
        canvasDrawerBuilder = function (canvas, options) {
            var context = canvas.getContext('2d'),
                opts = $.extend({}, defaultOptions, options),
                histories = [],
                historyIndex = 0,
                backgroundColor = context.fillStyle;
            
            return {
                shapeDrawer: shapeDrawer,
                undo: undo,
                redo: redo,
                canvas: function () {
                    return canvas;
                },
                histories: function (histo) {
                    if (histo) {
                        histories = histo;
                        if (historyIndex >= histories.length) {
                            historyIndex = histories.length - 1;
                        }
                    }
                    
                    return histories;
                },
                properties: function (props) {
                    var drawerProperties;
                    
                    if (props) {
                        setContextProperties(context, props);
                        
                        if (props.backgroundColor !== 'undefined') {
                            backgroundColor = props.backgroundColor;
                        }
                    }
                    
                    drawerProperties = getContextProperties(context);
                    drawerProperties.backgroundColor = backgroundColor;
                    
                    return drawerProperties;
                },
                clear: function () {
                     clearCanvas(canvas, context, backgroundColor);
                },
                history: function (index) {
                    if ((index || index === 0) && index < histories.length) {
                        historyIndex = index;
                        clearCanvas(canvas, context, backgroundColor);
                        restoreContextImage(context, histories[index]);
                    }
                    
                    return historyIndex;
                },
                store: function () {
                    if (histories.length === opts.historicSize) {
                        histories.shift();
                    }
                    histories.push(canvas.toDataURL());
                    historyIndex = (histories.length - 1);
                },
                init: function () {
                    clearCanvas(canvas, context, backgroundColor);
                    histories = [];
                    this.store();
                }
            };
        },
        // namespace
        drawingBuilder = function () {
            return {
                canvasDrawer: canvasDrawerBuilder
            };
        };
    
    if (typeof(window.drawing) !== 'object') {
        window.drawing = drawingBuilder();
    }
}());

(function (drawing) {
    'use strict';
        // line
    var drawLine = function (context, origin, current) {
            context.beginPath();
            context.lineTo(origin.x, origin.y);
            context.lineTo(current.x, current.y);
            context.stroke();
        },
        lineBuilder = function (context) {
            var orig,
                clear,
                line = {
                    open: function (origin, clearCallback) {
                        orig = origin;
                        clear = clearCallback;
                    },
                    draw: function (current) {
                        clear();
                        drawLine(context, orig, current);
                    }
                };
            
            return line;
        },
        // rectangle
        drawRectangle = function (context, origin, current) {
            var width = current.x - origin.x,
                height = current.y - origin.y;
            
           context.strokeRect(origin.x, origin.y, width, height);
        },
        rectangleBuilder = function (context) {
            var orig,
                clear,
                rectangle = {
                    open: function (origin, clearCallback) {
                        orig = origin;
                        clear = clearCallback;
                    },
                    draw: function (current) {
                        clear();
                        drawRectangle(context, orig, current);
                    }
                };
            
            return rectangle;
        },
        // circle
        drawCircle = function (context, origin, current) {
            var px = Math.pow(current.x - origin.x, 2),
                py = Math.pow(current.y - origin.y, 2),
                radius = Math.sqrt(px + py);
            
            context.beginPath();
            context.arc(origin.x, origin.y, radius,
                0, Math.PI * 2, false);
            context.stroke();
        },
        circleBuilder = function (context) {
            var orig,
                clear,
                circle = {
                    open: function (origin, clearCallback) {
                        orig = origin;
                        clear = clearCallback;
                    },
                    draw: function (current) {
                        clear();
                        drawCircle(context, orig, current);
                    }
                };
            
            return circle;
        },
        // pencil
        drawPoint = function (context, current) {
            var radius = Math.round(context.lineWidth / 2);

            context.arc(current.x, current.y,
                radius > 0 && radius || 1,
                0, Math.PI * 2, false);
            context.fill();
        },
        pencilDraw = function (context, current) {
            context.lineTo(current.x, current.y);
            context.stroke();
        },
        pencilBuilder = function (context) {
            var orig,
                hasDrawn = false,
                pencil = {
                    open: function (origin) {
                        orig = origin;
                        context.beginPath();
                    },
                    draw: function (current) {
                        hasDrawn = true;
                        pencilDraw(context, current);
                    },
                    close: function () {
                        context.closePath();
                        if (!hasDrawn) {
                            drawPoint(context, orig);
                        }
                    }
                };
            
            return pencil;
        };
    
    if (typeof(drawing.shapes) !== 'object') {
        drawing.shapes = {
            line: lineBuilder,
            rectangle: rectangleBuilder,
            circle: circleBuilder,
            pencil: pencilBuilder
        };
    }
}(window.drawing));

(function (drawing) {
    'use strict';
    var shapeDrawerBuilder = function (canvasDrawer, kind) {
            var canvas = canvasDrawer.canvas(),
                context = canvas.getContext('2d'),
                shape = drawing.shapes[kind](context),
                image;
            
            if (!shape) {
                throw new Error('Unknown shape kind: ' + kind);
            }
            
            return {
                begin: function (position) {
                    image = context.getImageData(0, 0, canvas.width,
                        canvas.height);
                        
                    if (shape.hasOwnProperty('open')) {
                        shape.open(position, function () {
                            canvasDrawer.clear();
                            context.putImageData(image, 0, 0);
                        });
                    }
                },
                update: function (position) {
                    shape.draw(position);
                },
                end: function () {
                    if (shape.hasOwnProperty('close')) {
                        shape.close();
                    }
                    canvasDrawer.store();
                }
            };
        };
    
    if (typeof(drawing.shapeDrawer) !== 'function') {
        drawing.shapeDrawer = shapeDrawerBuilder;
    }
}(window.drawing));
