/*
A simple canvas drawing library.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (window, document, jQuery, undefined) {
    'use strict';

    (function (factory) {
        if (typeof(define) === 'function' && define['amd']) {
            define(['jquery', 'exports'], factory);
        } else {
            factory(jQuery, window['drawing'] = {});
        }
    }(function ($, exports) {
        var defaultOptions = {
                backgroundColor: 'transparent',
                historicSize: 100
            },

            managedCanvasProperties = [
                'strokeStyle',
                'fillStyle',
                'lineWidth',
                'lineCap'
            ],
            
            getContextProperties = function (context) {
                var properties = {},
                    i, len, property;
                
                for (i = 0, len = managedCanvasProperties.length; i < len; i++) {
                    property = managedCanvasProperties[i];
                    properties[property] = context[property];
                }
                
                return properties;
            },
            
            setContextProperties = function (context, properties) {
                var i, len, property;
                
                for (i = 0, len = managedCanvasProperties.length; i < len; i++) {
                    property = managedCanvasProperties[i];
                    if (properties[property] !== undefined) {
                        context[property] = properties[property];
                    }
                }
            },

            setBackgroundFromDataURL = function (context, imageDataURL, callback) {
                var image = new window.Image();
                
                image.onload = function () {
                    context.drawImage(image, 0, 0);
                    callback();
                };
                
                image.src = imageDataURL;
            },
            
            setBackgroundFromColor = function (context, color) {
                var canvas = context.canvas,
                    fillStyle = context.fillStyle;

                context.fillStyle = color;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = fillStyle;
            },

            setBackground = function (context, background) {
                if (background instanceof window.Image) {
                    context.drawImage(background, 0, 0);
                } else {
                    setBackgroundFromColor(context, background);
                }
            },
            
            clearCanvas = function (canvas) {
                canvas.width = canvas.width;
            },

            cloneCanvas = function (canvas) {
                //create a new canvas
                var newCanvas = document.createElement('canvas');

                // set the size of the new canvas
                newCanvas.height = canvas.height;
                newCanvas.width = canvas.width;

                //apply the old canvas to the new one
                newCanvas.getContext('2d')
                         .drawImage(canvas, 0, 0);

                //return the new canvas
                return newCanvas;
            },
            
            buildLineDrawer = function () {
                var drawLine = function (context, origin, current) {
                        context.beginPath();
                        context.lineTo(origin.x, origin.y);
                        context.lineTo(current.x, current.y);
                        context.stroke();
                    };
                
                return function (context) {
                    var lineContext,
                        line = {
                            begin: function (shapeContext) {
                                lineContext = shapeContext;
                            },

                            draw: function (position) {
                                lineContext.restore();
                                drawLine(context, lineContext.origin, position);
                                lineContext.commands[0] = {
                                    name: 'draw',
                                    position: position
                                };
                            }
                        };
                    
                    return line;
                };
            },
            
            buildRectangleDrawer = function () {
                var drawRectangle = function (context, origin, current) {
                        var width = current.x - origin.x,
                            height = current.y - origin.y;
                        
                       context.strokeRect(origin.x, origin.y, width, height);
                    };
            
                return function (context) {
                    var rectangleContext,
                        rectangle = {
                            begin: function (shapeContext) {
                                rectangleContext = shapeContext;
                            },

                            draw: function (position) {
                                rectangleContext.restore();
                                drawRectangle(context, rectangleContext.origin,
                                    position);
                                rectangleContext.commands[0] = {
                                    name: 'draw',
                                    position: position
                                };
                            }
                        };
                    
                    return rectangle;
                };
            },
            
            buildCircleDrawer = function () {
                var drawCircle = function (context, origin, current) {
                        var px = Math.pow(current.x - origin.x, 2),
                            py = Math.pow(current.y - origin.y, 2),
                            radius = Math.sqrt(px + py);
                        
                        context.beginPath();
                        context.arc(origin.x, origin.y, radius,
                            0, Math.PI * 2, false);
                        context.stroke();
                    };
            
                return function (context) {
                    var circleContext,
                        circle = {
                            begin: function (shapeContext) {
                                circleContext = shapeContext;
                            },

                            draw: function (position) {
                                circleContext.restore();
                                drawCircle(context, circleContext.origin,
                                           position);
                                circleContext.commands[0] = {
                                    name: 'draw',
                                    position: position
                                };
                            }
                        };
                    
                    return circle;
                };
            },

            buildPencilDrawer = function () {
                var drawPoint = function (context, current) {
                        var radius = Math.round(context.lineWidth / 2);
            
                        context.arc(current.x, current.y,
                            radius > 0 && radius || 1,
                            0, Math.PI * 2, false);
                        context.fill();
                    },

                    drawLine = function (context, current) {
                        context.lineTo(current.x, current.y);
                        context.stroke();
                    };
                                
                return function (context) {
                    var pencilContext,
                        hasBegin,
                        hasDrawn,
                        pencil = {
                            begin: function (shapeContext) {
                                pencilContext = shapeContext;
                                hasBegin = true;
                                hasDrawn = false;
                                context.beginPath();
                            },

                            draw: function (position) {
                                hasDrawn = true;
                                drawLine(context, position);
                                pencilContext.commands.push({
                                    name: 'draw',
                                    position: position
                                });
                            },

                            end: function () {
                                if (!hasBegin) {
                                    return;
                                }
                                
                                context.closePath();
                                if (!hasDrawn) {
                                    drawPoint(context, pencilContext.origin);
                                    pencilContext.commands.push({
                                        name: 'end',
                                        position: null
                                    });
                                }
                                hasBegin = false;
                            }
                        };
                    
                    return pencil;
                };
            },

            CanvasDrawer = function (canvas, options) {
                var _this = this,
                    context = canvas.getContext('2d'),
                    opts = $.extend({}, defaultOptions, options),
                    snapshots = [],
                    cursor = 0,
                    properties = getContextProperties(context),
                    originalBackground = canvas.toDataURL();
                    
                this.context = function () {
                    return context;
                };

                this.properties = function (newProperties) {
                    if (newProperties) {
                        setContextProperties(context, newProperties);
                        properties = getContextProperties(context);
                    }
                    
                    return getContextProperties(context);
                };
                
                this.snapshots = function (newSnapshots) {
                    if (newSnapshots) {
                        snapshots = newSnapshots;
                        if (cursor > snapshots.length - 1) {
                            cursor = snapshots.length - 1;
                        }
                    }
                    
                    return snapshots.slice(0);
                };
                    
                this.cursor = function (index, callback) {
                    if (index || index === 0) {
                        cursor = index;
                        clearCanvas(canvas);
                        setContextProperties(context, properties);
                        setBackgroundFromDataURL(context, snapshots[cursor],
                                                 function () {
                            if (callback && typeof(callback) === 'function') {
                                callback.call(_this);
                            }
                        });
                    }
                    
                    return cursor;
                };
                
                this.store = function () {
                    if (snapshots.length === opts.historicSize) {
                        snapshots.shift();
                    }
                    snapshots.push(canvas.toDataURL());
                    cursor = (snapshots.length - 1);

                    return this;
                };

                this.clear = function () {
                    clearCanvas(canvas);
                    setContextProperties(context, properties);
                    setBackground(context, originalBackground);

                    return this;
                };
                
                this.newDrawing = function (background) {
                    snapshots.length = 0;
                    cursor = 0;
                    clearCanvas(canvas);
                    properties = getContextProperties(context);
                    originalBackground = background || opts.backgroundColor;
                    setBackground(context, originalBackground);

                    return this.store();
                };
            };
        
        CanvasDrawer.prototype = {
            shapeDrawer: function (kind) {
                var _this = this,
                    context = this.context(),
                    canvas = context.canvas,
                    shapeDrawer = exports.shapes[kind](context),
                    shapeContext;
                
                if (!shapeDrawer) {
                    throw new Error('Unknown shape kind: ' + kind);
                }
                
                return {
                    begin: function (position) {
                        var canvasState = cloneCanvas(canvas),
                            propertiesState = getContextProperties(context);

                        shapeContext = {
                            commands: [],
                            origin: position,
                            restore: function () {
                                clearCanvas(canvas);
                                setContextProperties(context, propertiesState);
                                context.drawImage(canvasState, 0, 0);
                            }
                        };
                        
                        shapeDrawer.begin(shapeContext);
                    },

                    draw: function (position) {
                        shapeDrawer.draw(position);
                    },

                    end: function () {
                        var drawData;

                        if (shapeDrawer.hasOwnProperty('end')) {
                            shapeDrawer.end();
                        }

                        _this.store();
                        
                        drawData = {
                            kind: kind,
                            properties: _this.properties(),
                            origin: shapeContext.origin,
                            commands: shapeContext.commands
                        };

                        shapeContext = null;

                        return drawData;
                    }
                };
            },

            draw: function (shape) {
                var shapeDrawer = this.shapeDrawer(shape.kind),
                    properties = this.properties(),
                    i, len, command;
                
                this.properties(shape.properties);
                
                shapeDrawer.begin(shape.origin);
                for (i = 0, len = shape.commands.length; i < len; i++) {
                    command = shape.commands[i];
                    shapeDrawer[command.name](command.position);
                }
                
                this.properties(properties);
                
                return this;
            },

            undo: function () {
                var cursor = this.cursor(),
                    isFirst = (cursor <= 0);
                
                if (!isFirst) {
                    this.cursor(cursor - 1);
                }
                
                return !isFirst;
            },

            redo: function () {
                var cursor = this.cursor(),
                    isLast = (cursor + 1 >= this.snapshots().length);
                
                if (!isLast) {
                    this.cursor(cursor + 1);
                }
                
                return !isLast;
            },

            save: function () {
                var canvas = this.context().canvas;

                window.location.href =
                    canvas.toDataURL()
                          .replace('image/png', 'image/octet-stream');

                return this;
            }
        };
        
        exports.canvasDrawer = function (canvas, options) {
            return new CanvasDrawer(canvas, options);
        };

        exports.canvasDrawer.fn = CanvasDrawer.prototype;

        exports.shapes = {
            line: buildLineDrawer(),
            rectangle: buildRectangleDrawer(),
            circle: buildCircleDrawer(),
            pencil: buildPencilDrawer()
        };
    }));
}(window, document, window['jQuery']));
