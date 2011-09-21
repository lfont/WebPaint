/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

"use strict";
jQuery(function ($) {
    var SETTINGS_STORAGE_KEY = "settings",
        settings = {},
        colors,
        loadSettings = function () {
            var settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY),
                defaultSettings = {
                    locale: "",
                    histories: []
                },
                userSettings;

            if (settingsString) {
                try {
                    userSettings = JSON.parse(settingsString);
                    $.extend(settings, defaultSettings, userSettings);
                    return;
                } catch (error) {
                    console.error(error.message);
                }
            }

            settings = defaultSettings;
        },
        storeSettings = function () {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        },
        l = function (string) {
            return string.toLocaleString();
        },
        webPaint = Mvc.application({
            main: (function () {
                var isInitialized = false,
                    canvas,
                    context,
                    gesture,
                    historyIndex = 0,
                    defaultContextProperty = {
                        backgroundColor: "transparent",
                        strokeStyle: "#000000",
                        fillStyle: "#000000",
                        lineWidth: 1,
                        lineCap: "round"
                    },
                    contextProperty,
                    translate = function () {
                        this.page.title = l("%main.title");
                        this.page.undoButton = l("%main.undoButton");
                        this.page.redoButton = l("%main.redoButton");
                        this.page.widthButton = l("%main.widthButton");
                        this.page.colorButton = l("%main.colorButton");
                        this.page.optionButton = l("%main.optionButton");
                    },
                    getDataURL,
                    initializeDataEncoder = function () {
                        var jpegEncoder;

                        if (canvas.toDataURL().indexOf("png") > -1) {
                            getDataURL = function () {
                                return canvas.toDataURL();
                            };
                        } else {
                            // This is a fallback for devices that don't support
                            // toDataURL method like Android < 3.0
                            jpegEncoder = new JPEGEncoder(80);
                            getDataURL = function () {
                                return jpegEncoder.encode(
                                    context.getImageData(0, 0, canvas.width,
                                        canvas.height));
                            };
                        }
                    },
                    fixContentGeometry = function () {
                        /* Calculate the geometry that our content area should take */
                        var contentHeight = $(window).height() -
                            this.page.$header.outerHeight() -
                                (this.page.$footer &&
                                    this.page.$footer.outerHeight() || 0);

                        /* Trim margin/border/padding height */
                        contentHeight -= (this.page.$content.outerHeight() -
                            this.page.$content.height());
                        this.page.$content.height(contentHeight);
                    },
                    fixCanvasGeometry = function () {
                        canvas.height = (this.page.$content.height() -
                            (this.page.$canvas.outerHeight() -
                                this.page.$canvas.height()));
                        canvas.width = (this.page.$content.width() -
                            (this.page.$canvas.outerWidth() -
                                this.page.$canvas.width()));
                    },
                    setContextProperties = function () {
                        context.strokeStyle = contextProperty.strokeStyle;
                        context.fillStyle = contextProperty.fillStyle;
                        context.lineWidth = contextProperty.lineWidth;
                        context.lineCap = contextProperty.lineCap;
                    },
                    drawBackground = function (color) {
                        var fillStyle = context.fillStyle;

                        context.fillStyle = color;
                        context.fillRect(0, 0, canvas.width,
                            canvas.height);
                        context.fillStyle = fillStyle;
                    },
                    drawPoint = function (pageX, pageY) {
                        var x = pageX - canvas.offsetLeft,
                            y = pageY - canvas.offsetTop,
                            radius = Math.round(context.lineWidth / 2);

                        context.arc(x, y, radius > 0 && radius || 1,
                                    0, Math.PI * 2, false);
                        context.fill();
                    },
                    drawLine = function (pageX, pageY) {
                        var x = pageX - canvas.offsetLeft,
                            y = pageY - canvas.offsetTop;

                        context.lineTo(x, y);
                        context.stroke();
                    },
                    drawLineHandler = function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        gesture.hasMove = true;
                        drawLine(event.pageX, event.pageY);
                    },
                    store = function () {
                        if (settings.histories.length === 10) {
                            // We keep only the last 10 changes.
                            settings.histories.shift();
                        }
                        settings.histories.push(getDataURL());
                        historyIndex = (settings.histories.length - 1);
                        storeSettings();
                    },
                    restore = function () {
                        var image = new Image();

                        this.clear();
                        image.onload = function () {
                            context.drawImage(image, 0, 0);
                        };
                        image.src = settings.histories[historyIndex];
                    };

                return Mvc.controller({
                    page: {
                        title: "",
                        undoButton: "",
                        redoButton: "",
                        widthButton: "",
                        colorButton: "",
                        optionButton: "",
                        $header: null,
                        $content: null,
                        $canvas: null
                    },
                    pagebeforecreate: function (event, callback) {
                        var that = this;

                        $("body").bind("vmouseup", function () {
                            if (gesture) {
                                that.page.$canvas.unbind("vmousemove",
                                    drawLineHandler);
                                if (!gesture.hasMove) {
                                    drawPoint(gesture.pageX, gesture.pageY);
                                }
                                context.closePath();
                                store();
                                gesture = null;
                            }
                        });

                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event) {
                        if (!canvas) {
                            canvas = this.page.$canvas[0];
                            context = canvas.getContext("2d");
                        }

                        if (event.arguments.method) {
                            this[event.arguments.method].apply(this,
                                event.arguments.methodArguments);
                        }
                    },
                    pageshow: function () {
                        if (!isInitialized) {
                            isInitialized = true;
                            initializeDataEncoder();
                            fixContentGeometry.call(this);
                            fixCanvasGeometry.call(this);
                            if (settings.histories.length) {
                                // Restore the last drawing if it exists.
                                contextProperty = $.extend({}, defaultContextProperty);
                                historyIndex = (settings.histories.length - 1);
                                restore.call(this);
                            } else {
                                this.newDrawing();
                            }
                        }
                    },
                    pagebeforehide: function (event) {
                        event.arguments.canvasProperty = {};
                        event.arguments.canvasProperty.strokeStyle =
                            context.strokeStyle;
                        event.arguments.canvasProperty.lineWidth = context.lineWidth;
                    },
                    draw: function (event) {
                        gesture = {
                            pageX: event.pageX,
                            pageY: event.pageY,
                            hasMove: false
                        };
                        context.beginPath();
                        this.page.$canvas.bind("vmousemove", drawLineHandler);
                    },
                    clear: function () {
                        canvas.width = canvas.width;
                        setContextProperties();
                        drawBackground(contextProperty.backgroundColor);
                    },
                    newDrawing: function (backgroundColor) {
                        contextProperty = $.extend({}, defaultContextProperty);
                        if (backgroundColor) {
                            contextProperty.backgroundColor = backgroundColor;
                        }
                        this.clear();
                        settings.histories = [];
                        store();
                    },
                    setLineWidth: function (width) {
                        contextProperty.lineWidth = width;
                        setContextProperties();
                    },
                    setStrokeStyle: function (style) {
                        contextProperty.strokeStyle = style;
                        contextProperty.fillStyle = style;
                        setContextProperties();
                    },
                    setHistory: function (index) {
                        historyIndex = index;
                        restore.call(this);
                    },
                    undo: function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        if (historyIndex > 0) {
                            historyIndex -= 1;
                            restore.call(this);
                        }
                    },
                    redo: function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        if ((historyIndex + 1) < settings.histories.length) {
                            historyIndex += 1;
                            restore.call(this);
                        }
                    }
                });
            }()),
            option: (function () {
                var mainMethod,
                    translate = function () {
                        this.page.title = l("%option.title");
                        this.model.options = [
                            { link: "#newDrawing", method: "", arguments: "",
                                name: l("%option.new") },
                            { link: "", method: "callMainMethod",
                                arguments: "clear", name: l("%option.clear") },
                            { link: "#history", method: "", arguments: "",
                                name: l("%option.history") },
                            { link: "#language", method: "", arguments: "",
                                name: l("%option.language") },
                            { link: "#about", method: "", arguments: "",
                                name: l("%option.about") }
                        ];
                    };

                return Mvc.controller({
                    page: {
                        title: ""
                    },
                    model: {
                        options: null
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event) {
                        mainMethod = null;
                    },
                    pagebeforehide: function (event) {
                        if (mainMethod) {
                            event.arguments.method = mainMethod;
                        }
                    },
                    callMainMethod: function (event, callback, method) {
                        mainMethod = method;
                        history.back();
                    }
                });
            }()),
            newDrawing: (function () {
                var color,
                    translate = function () {
                        this.page.title = l("%newDrawing.title");
                    };

                return Mvc.controller({
                    page: {
                        title: ""
                    },
                    model: {
                        colors: null
                    },
                    pagebeforecreate: function (event, callback) {
                        this.model.colors = colors;
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function () {
                        color = null;
                    },
                    pagebeforehide: function (event) {
                        if (color) {
                            event.arguments.method = "newDrawing";
                            event.arguments.methodArguments = [ color ];
                        }
                    },
                    setColor: function (event, callback, colorCode) {
                        color = colorCode;
                        $.mobile.changePage("#main",
                            { transition: "fade", reverse: true });
                    }
                });
            }()),
            width: (function () {
                var width,
                    $range,
                    translate = function () {
                        this.page.title = l("%width.title");
                        this.page.sliderLabel = l("%width.sliderLabel");
                    };

                return Mvc.controller({
                    page: {
                        title: "",
                        sliderLabel: "",
                        $slider: null
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event, callback) {
                        width = event.arguments.canvasProperty.lineWidth;
                        if (!$range) {
                            $range = this.page.$slider
                                              .find("input[data-type='range']");
                        }
                    },
                    pageshow: function () {
                        $range.val(width)
                              .slider("refresh");
                    },
                    pagebeforehide: function (event) {
                        event.arguments.method = "setLineWidth";
                        event.arguments.methodArguments = [ $range.val() ];
                    }
                });
            }()),
            color: (function () {
                var color,
                    translate = function () {
                        this.page.title = l("%color.title");
                    };

                return Mvc.controller({
                    page: {
                        title: ""
                    },
                    model: {
                        colors: null
                    },
                    selectedColorCode: "",
                    pagebeforecreate: function (event, callback) {
                        this.model.colors = colors;
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event, callback) {
                        color = null;
                        this.selectedColorCode =
                            event.arguments.canvasProperty.strokeStyle;
                        callback(this.renderView("pagebeforeshow")).trigger("create");
                    },
                    pagebeforehide: function (event) {
                        if (color) {
                            event.arguments.method = "setStrokeStyle";
                            event.arguments.methodArguments = [ color ];
                        }
                    },
                    setColor: function (event, callback, colorCode) {
                        color = colorCode;
                        history.back();
                    }
                });
            }()),
            history: (function () {
                var historyIndex,
                    translate = function () {
                        this.page.title = l("%history.title");
                        this.page.historyLabel = l("%history.historyLabel");
                    };

                return Mvc.controller({
                    page: {
                        title: "",
                        historyLabel: ""
                    },
                    model: {
                        histories: []
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event, callback) {
                        historyIndex = null;
                        this.model.histories = settings.histories;
                        callback(this.renderView("pagebeforeshow")).trigger("create");
                    },
                    pagebeforehide: function (event) {
                        if (historyIndex !== null) {
                            event.arguments.method = "setHistory";
                            event.arguments.methodArguments = [ historyIndex ];
                        }
                    },
                    setHistoryIndex: function (event, callback, index) {
                        historyIndex = index;
                        $.mobile.changePage("#main",
                            { transition: "fade", reverse: true });
                    }
                });
            }()),
            language: (function () {
                var translate = function () {
                    this.page.title = l("%language.title");
                    this.page.information = l("%language.information");
                    this.model.languages = [
                        { code: "xx-XX", name: l("%language.default") },
                        { code: "en-US", name: l("%language.english") },
                        { code: "fr-FR", name: l("%language.french") }
                    ];
                };

                return Mvc.controller({
                    page: {
                        title: "",
                        information: ""
                    },
                    model: {
                        languages: null
                    },
                    selectedLanguageCode: "",
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    },
                    pagebeforeshow: function (event, callback) {
                        this.selectedLanguageCode = (settings.locale === "") ?
                            "xx-XX" : settings.locale;
                        callback(this.renderView("pagebeforeshow")).trigger("create");
                    },
                    setLanguage: function (event, callback, languageCode) {
                        settings.locale = (languageCode === "xx-XX") ?
                            "" : languageCode;
                        storeSettings();
                        history.back();
                    }
                });
            }()),
            about: (function () {
                var translate = function () {
                    this.page.title = l("%about.title");
                    this.page.description = l("%about.description");
                    this.page.source = l("%about.source");
                };

                return Mvc.controller({
                    page: {
                        title: "",
                        version: "WebPaint 0.1",
                        description: "",
                        source: ""
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView("pagebeforecreate"));
                    }
                });
            }())
        });

    loadSettings();
    if (settings.locale) {
       String.locale = settings.locale;
    }

    colors = [
        { code: "transparent", name: l("%transparent") },
        { code: "#000000", name: l("%black") },
        { code: "#d2691e", name: l("%chocolate") },
        { code: "#ffffff", name: l("%white") },
        { code: "#ffc0cb", name: l("%pink") },
        { code: "#ff0000", name: l("%red") },
        { code: "#ffa500", name: l("%orange") },
        { code: "#ee82ee", name: l("%violet") },
        { code: "#0000ff", name: l("%blue") },
        { code: "#40e0d0", name: l("%turquoise") },
        { code: "#008000", name: l("%green") },
        { code: "#ffff00", name: l("%yellow") }
    ];

    webPaint.start({
        pageEvents: [ "pagebeforecreate", "pagecreate", "pagebeforeshow",
            "pageshow", "pagebeforehide" ]
    });
});
