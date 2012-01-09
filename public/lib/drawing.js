/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function () {
    'use strict';
    var $ = window.jQuery,
        defaultOptions = {
            historicSize: 100
        },
        defaultBackgroundColor = 'transparent',
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
        setContextProperties = function (context, properties, newProperties) {
            if (!newProperties) {
                newProperties = properties;
            }
            
            if (newProperties.strokeStyle !== undefined) {
                properties.strokeStyle = newProperties.strokeStyle;
                context.strokeStyle = properties.strokeStyle;
            }
            
            if (newProperties.fillStyle !== undefined) {
                properties.fillStyle = newProperties.fillStyle;
                context.fillStyle = properties.fillStyle;
            }
            
            if (newProperties.lineWidth !== undefined) {
                properties.lineWidth = newProperties.lineWidth;
                context.lineWidth = properties.lineWidth;
            }
            
            if (newProperties.lineCap !== undefined) {
                properties.lineCap = newProperties.lineCap;
                context.lineCap = properties.lineCap;
            }
        },
        drawCanvasBackground = function (canvas, context, color) {
            var fillStyle = context.fillStyle;

            context.fillStyle = color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = fillStyle;
        },
        clearCanvas = function (canvas) {  
            canvas.width = canvas.width;
        },
        // canvasBuilder
        shapeDrawer = function (kind) {
            return window.drawing.shapeDrawer(this, kind);
        },
        undo = function () {
            var history = this.history(),
                isFirst = (history <= 0);
            
            if (!isFirst) {
                this.history(history - 1);
            }
            
            return !isFirst;
        },
        redo = function () {
            var history = this.history(),
                isLast = (history + 1 >= this.histories().length);
            
            if (!isLast) {
                this.history(history + 1);
            }
            
            return !isLast;
        },
        saveAs = function () {
            window.location.href = this.canvas().toDataURL()
                .replace('image/png', 'image/octet-stream');
            return this;
        },
        canvasDrawerBuilder = function (canvas, options) {
            var context = canvas.getContext('2d'),
                opts = $.extend({}, defaultOptions, options),
                histories,
                historyIndex,
                background,
                props,
                drawer = {
                    shapeDrawer: shapeDrawer,
                    undo: undo,
                    redo: redo,
                    saveAs: saveAs,
                    canvas: function () {
                        return canvas;
                    },
                    histories: function (histo) {
                        if (histo) {
                            histories = histo;
                            if (historyIndex > histories.length - 1) {
                                historyIndex = histories.length - 1;
                            }
                        }
                        
                        return histories;
                    },
                    properties: function (newProps) {
                        if (newProps) {
                            setContextProperties(context, props, newProps);  
                        }
                        
                        return props;
                    },
                    history: function (index) {
                        if (index || index === 0) {
                            historyIndex = index;
                            clearCanvas(canvas);
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
                        return this;
                    },
                    clear: function () {
                        clearCanvas(canvas);
                        setContextProperties(context, props);
                        drawCanvasBackground(canvas, context, background);
                        return this;
                    },
                    init: function (backgroundColor) {
                        histories = [];
                        historyIndex = 0;
                        clearCanvas(canvas);
                        props = getContextProperties(context);
                        setContextProperties(context, props);
                        background = backgroundColor || defaultBackgroundColor;
                        drawCanvasBackground(canvas, context, background);
                        return this.store();
                    }
                };
            
            return drawer.init();
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
                hasDrawn,
                pencil = {
                    open: function (origin) {
                        hasDrawn = false;
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
