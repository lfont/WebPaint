/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (mvc, drawing, $) {
    'use strict';
    var colors,
        // localization
        l = function (string) {
            return string.toLocaleString();
        },
        // navigation
        goToPage = function (name) {
            $.mobile.changePage(name, {
                transition: 'fade',
                reverse: true
            });
        },
        // application
        webPaint = mvc.application({
            main: (function () {
                var isInitialized = false,
                    drawer,
                    translate = function () {
                        this.page.title = l('%main.title');
                        this.page.undoButton = l('%main.undoButton');
                        this.page.redoButton = l('%main.redoButton');
                        this.page.widthButton = l('%main.widthButton');
                        this.page.colorButton = l('%main.colorButton');
                        this.page.optionButton = l('%main.optionButton');
                        
                        colors = [{
                            code: 'transparent',
                            name: l('%transparent')
                        }, {
                            code: '#000000',
                            name: l('%black')
                        }, {
                            code: '#d2691e',
                            name: l('%chocolate')
                        }, {
                            code: '#ffffff',
                            name: l('%white')
                        }, {
                            code: '#ffc0cb',
                            name: l('%pink')
                        }, {
                            code: '#ff0000',
                            name: l('%red')
                        }, {
                            code: '#ffa500',
                            name: l('%orange')
                        }, {
                            code: '#ee82ee',
                            name: l('%violet')
                        }, {
                            code: '#0000ff',
                            name: l('%blue')
                        }, {
                            code: '#40e0d0',
                            name: l('%turquoise')
                        }, {
                            code: '#008000',
                            name: l('%green')
                        }, {
                            code: '#ffff00',
                            name: l('%yellow')
                        }];
                    },
                    // settings
                    SETTINGS_STORAGE_KEY = 'settings',
                    settings = {},
                    loadSettings = function () {
                        var settingsString = localStorage
                                .getItem(SETTINGS_STORAGE_KEY),
                            defaultSettings = {
                                locale: '',
                                drawer: {
                                    shape: 'pencil',
                                    properties: {
                                        backgroundColor: 'transparent',
                                        strokeStyle: '#000000',
                                        fillStyle: '#000000',
                                        lineWidth: 1,
                                        lineCap: 'round'
                                    },
                                    histories: [],
                                    historicSize: 10,
                                    history: 0
                                }
                            },
                            userSettings;
                        if (settingsString) {
                            try {
                                userSettings = JSON.parse(settingsString);
                                $.extend(settings, defaultSettings,
                                    userSettings);
                                return;
                            }
                            catch (error) {
                                console.error(error.message);
                            }
                        }
                        settings = defaultSettings;
                    },
                    storeSettings = function () {
                        localStorage.setItem(SETTINGS_STORAGE_KEY,
                            JSON.stringify(settings));
                    },
                    // geometry
                    fixContentGeometry = function () {
                        var contentHeight = $(window).height() -
                            this.page.header.outerHeight() -
                            (this.page.footer &&
                                this.page.footer.outerHeight() || 0);
                                
                        contentHeight -= (this.page.content.outerHeight() -
                            this.page.content.height());
                        this.page.content.height(contentHeight);
                    },
                    fixCanvasGeometry = function () {
                        var canvas = this.page.canvas[0];
                        
                        canvas.height = (this.page.content.height() -
                            (this.page.canvas.outerHeight() -
                                this.page.canvas.height()));
                        canvas.width = (this.page.content.width() -
                            (this.page.canvas.outerWidth() -
                                this.page.canvas.width()));
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        undoButton: '',
                        redoButton: '',
                        widthButton: '',
                        colorButton: '',
                        optionButton: '',
                        header: null,
                        content: null,
                        canvas: null
                    },
                    pagebeforecreate: function (event, callback) {
                        loadSettings();
                        if (settings.locale) {
                            String.locale = settings.locale;
                        }
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event) {
                        if (!drawer) {
                            drawer = drawing.canvasDrawer(this.page.canvas[0], {
                                historicSize: settings.drawer.historicSize    
                            });
                            drawer.properties(settings.drawer.properties);
                            drawer.histories(settings.drawer.histories);
                            drawing.canvasDrawerEventWrapper(drawer, {
                                events: {
                                    down: 'vmousedown',
                                    up: 'vmouseup',
                                    move: 'vmousemove'
                                }
                            });
                            
                            if (settings.drawer.histories.length) {
                                this.setHistory(settings.drawer.history);
                            }
                            else {
                                this.newDrawing();
                            }
                            
                            this.setShape(settings.drawer.shape);
                        }
                        
                        if (event.mvcData.method) {
                            this[event.mvcData.method.name].apply(this,
                                event.mvcData.method.args);
                        }
                    },
                    pageshow: function () {
                        if (!isInitialized) {
                            isInitialized = true;
                            fixContentGeometry.call(this);
                            fixCanvasGeometry.call(this);
                        }
                    },
                    pagebeforehide: function (event) {
                        event.mvcData.locale = settings.locale;
                        event.mvcData.drawer = {
                            properties: drawer.properties(),
                            histories: drawer.histories(),
                            history: drawer.history()
                        };
                    },
                    unload: function () {
                        console.log('Unloading WebPaint...');
                        settings.drawer.properties = drawer.properties();
                        settings.drawer.histories = drawer.histories();
                        settings.drawer.history = drawer.history();
                        storeSettings();
                    },
                    clear: function () {
                        drawer.clear();
                    },
                    newDrawing: function (backgroundColor) {
                        if (backgroundColor) {
                            drawer.properties({
                                backgroundColor: backgroundColor
                            });
                        }
                        drawer.init();
                    },
                    setLineWidth: function (width) {
                        drawer.properties({
                            lineWidth: width
                        });
                    },
                    setStyle: function (style) {
                        drawer.properties({
                            strokeStyle: style,
                            fillStyle: style
                        });
                    },
                    setHistory: function (index) {
                        drawer.history(index);
                    },
                    setShape: function (kind) {
                        settings.drawer.shape = kind;
                        drawer.eventShapeDrawer(kind);
                    },
                    setLocale: function (locale) {
                        settings.locale = locale;
                        window.location.reload();
                    },
                    undo: function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        drawer.undo();
                    },
                    redo: function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        drawer.redo();
                    }
                });
            }()),
            // option controller
            option: (function () {
                var mvcData,
                    methodName,
                    translate = function () {
                        this.page.title = l('%option.title');
                        this.model.options = [{
                            link: '#newDrawing',
                            name: l('%option.new')
                        }, {
                            link: '#',
                            method: {
                                name: 'callMethod',
                                args: 'clear'
                            },                            
                            name: l('%option.clear')
                        }, {
                            link: '#history',
                            name: l('%option.history')
                        }, {
                            link: '#language',
                            name: l('%option.language')
                        }, {
                            link: '#about',
                            name: l('%option.about')
                        }];
                    };
                    
                return mvc.controller({
                    page: {
                        title: ''
                    },
                    model: {
                        options: null
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event) {
                        methodName = null;
                        if (event.mvcData.locale || 
                            event.mvcData.drawer) {
                            mvcData = event.mvcData;
                        }
                    },
                    pagebeforehide: function (event) {
                        event.mvcData.locale = mvcData.locale;
                        event.mvcData.drawer = mvcData.drawer;
                        if (methodName) {
                            event.mvcData.method = {
                                name: methodName
                            };
                        }
                    },
                    callMethod: function (event, callback, name) {
                        methodName = name;
                        goToPage('#main');
                    }
                });
            }()),
            // newDrawing controller
            newDrawing: (function () {
                var color,
                    translate = function () {
                        this.page.title = l('%newDrawing.title');
                    };
                    
                return mvc.controller({
                    page: {
                        title: ''
                    },
                    model: {
                        colors: null
                    },
                    pagebeforecreate: function (event, callback) {
                        this.model.colors = colors;
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function () {
                        color = null;
                    },
                    pagebeforehide: function (event) {
                        if (color) {
                            event.mvcData.method = {
                                name: 'newDrawing',
                                args: [
                                    color
                                ]
                            };
                        }
                    },
                    setColor: function (event, callback, colorCode) {
                        color = colorCode;
                        goToPage('#main');
                    }
                });
            }()),
            // width controller
            width: (function () {
                var width,
                    range,
                    translate = function () {
                        this.page.title = l('%width.title');
                        this.page.sliderLabel = l('%width.sliderLabel');
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        sliderLabel: '',
                        slider: null
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event) {
                        width = event.mvcData.drawer.properties.lineWidth;
                        if (!range) {
                            range = this.page.slider
                                .find('input[data-type="range"]');
                        }
                    },
                    pageshow: function () {
                        range.val(width).slider('refresh');
                    },
                    pagebeforehide: function (event) {
                        event.mvcData.method = {
                            name: 'setLineWidth',
                            args: [
                                range.val()
                            ]
                        };
                    }
                });
            }()),
            // color controller
            color: (function () {
                var colorCode,
                    translate = function () {
                        this.page.title = l('%color.title');
                    };
                    
                return mvc.controller({
                    page: {
                        title: ''
                    },
                    model: {
                        colors: null,
                        color: ''
                    },
                    pagebeforecreate: function (event, callback) {
                        this.model.colors = colors;
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        colorCode = null;
                        this.model.color = event.mvcData.drawer
                            .properties.strokeStyle;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    pagebeforehide: function (event) {
                        if (colorCode) {
                            event.mvcData.method = {
                                name: 'setStyle',
                                args: [
                                    colorCode
                                ]
                            };
                        }
                    },
                    setColor: function (event, callback, code) {
                        colorCode = code;
                        goToPage('#main');
                    }
                });
            }()),
            // history controller
            history: (function () {
                var historyIndex,
                    translate = function () {
                        this.page.title = l('%history.title');
                        this.page.historyLabel = l('%history.historyLabel');
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        historyLabel: ''
                    },
                    model: {
                        histories: [],
                        history: 0
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        historyIndex = null;
                        this.model.histories = event.mvcData.drawer.histories;
                        this.model.history = event.mvcData.drawer.history;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    pagebeforehide: function (event) {
                        if (historyIndex !== null) {
                            event.mvcData.method = {
                                name: 'setHistory',
                                args: [
                                    historyIndex
                                ]
                            };
                        }
                    },
                    setHistoryIndex: function (event, callback, index) {
                        historyIndex = parseInt(index, 10);
                        goToPage('#main');
                    }
                });
            }()),
            // language controller
            language: (function () {
                var locale,
                    DEFAULT_LOCALE = 'xx-XX',
                    translate = function () {
                        this.page.title = l('%language.title');
                        this.page.information = l('%language.information');
                        this.model.languages = [{
                            code: DEFAULT_LOCALE,
                            name: l('%language.default')
                        }, {
                            code: 'en-US',
                            name: l('%language.english')
                        }, {
                            code: 'fr-FR',
                            name: l('%language.french')
                        }];
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        information: ''
                    },
                    model: {
                        languages: null,
                        locale: ''
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        locale = null;
                        this.model.locale =
                            (event.mvcData.locale === '') ?
                                DEFAULT_LOCALE :
                                event.mvcData.locale;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    pagebeforehide: function (event) {
                        if (locale !== null) {
                            event.mvcData.method = {
                                name: 'setLocale',
                                args: [
                                    locale
                                ]
                            };
                        }
                    },
                    setLanguage: function (event, callback, code) {
                        locale = (code === DEFAULT_LOCALE) ?
                            '' :
                            code;
                        goToPage('#main');
                    }
                });
            }()),
            // about controller
            about: (function () {
                var translate = function () {
                        this.page.title = l('%about.title');
                        this.page.description = l('%about.description');
                        this.page.source = l('%about.source');
                        this.page.follow = l('%about.follow');
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        version: 'WebPaint 0.1.5',
                        description: '',
                        source: ''
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    }
                });
            }())
        });
        
    $(function () {
        $(window).unload(webPaint.controllers.main.unload);
        
        webPaint.start({
            pageEvents: [
                'pagebeforecreate',
                'pagecreate',
                'pagebeforeshow',
                'pageshow',
                'pagebeforehide'
            ]
        });
    });
}(window.Mvc, window.drawing, window.jQuery));
