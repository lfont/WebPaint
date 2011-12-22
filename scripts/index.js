/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (mvc, drawing, $) {
    'use strict';
    var colors,
        // settings
        SETTINGS_STORAGE_KEY = 'settings',
        settings = {},
        loadSettings = function () {
            var settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY),
                defaultSettings = {
                    locale: '',
                    drawer = {
                        shape: 'pencil',
                        properties = {
                            backgroundColor: 'transparent',
                            strokeStyle: '#000000',
                            fillStyle: '#000000',
                            lineWidth: 1,
                            lineCap: 'round'
                        },
                        histories: []
                    }
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
            localStorage.setItem(SETTINGS_STORAGE_KEY,
                JSON.stringify(settings));
        },
        // translation
        l = function (string) {
            return string.toLocaleString();
        },
        // application
        webPaint = mvc.application({
            // main page
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
                    fixContentGeometry = function () {
                        /* Calculate the geometry that our content area 
                        should take */
                        var contentHeight = $(window).height() -
                            this.page.header.outerHeight() -
                                (this.page.footer &&
                                    this.page.footer.outerHeight() || 0);

                        /* Trim margin/border/padding height */
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
                            drawer = drawing.canvasDrawer(this.page.canvas[0]);
                            drawer.properties(settings.drawer.properties);
                            drawer.histories(settings.drawer.histories);
                            drawing.canvasDrawerEventWrapper(drawer, {
                                events: {
                                    down: 'vmousedown',
                                    up: 'vmouseup',
                                    move: 'vmousemove'
                                }
                            });
                                
                            if (settings.drawer.histories().length) {
                                this.setHistory(drawer.histories().length - 1);
                            } else {
                                this.newDrawing();
                            }
                            
                            this.setShape(settings.drawer.shape);
                        }

                        if (event.mvcData.method) {
                            this[event.mvcData.method].apply(this,
                                event.mvcData.methodArguments);
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
                        event.mvcData.drawerProperties = drawer.properties();
                        event.mvcData.drawerHistories = drawer.histories();
                    },
                    unload: function () {
                        settings.drawer.properties = drawer.properties();
                        settings.drawer.histories = drawer.histories();
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
            // option page
            option: (function () {
                var mainMethod,
                    translate = function () {
                        this.page.title = l('%option.title');
                        this.model.options = [{
                            link: '#newDrawing',
                            method: '',
                            methodArguments: '',
                            name: l('%option.new')
                        }, {
                            link: '',
                            method: 'callMainMethod',
                            methodArguments: 'clear',
                            name: l('%option.clear')
                        }, {
                            link: '#history',
                            method: '',
                            methodArguments: '',
                            name: l('%option.history')
                        }, {
                            link: '#language',
                            method: '',
                            methodArguments: '',
                            name: l('%option.language')
                        }, {
                            link: '#about',
                            method: '',
                            methodArguments: '',
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
                        mainMethod = null;
                    },
                    pagebeforehide: function (event) {
                        if (mainMethod) {
                            event.mvcData.method = mainMethod;
                        }
                    },
                    callMainMethod: function (event, callback, method) {
                        mainMethod = method;
                        window.history.back();
                    }
                });
            }()),
            // newDrawing page
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
                            event.mvcData.method = 'newDrawing';
                            event.mvcData.methodArguments = [
                                color
                            ];
                        }
                    },
                    setColor: function (event, callback, colorCode) {
                        color = colorCode;
                        $.mobile.changePage('#main', { 
                            transition: 'fade',
                            reverse: true
                        });
                    }
                });
            }()),
            // width page
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
                    pagebeforeshow: function (event, callback) {
                        width = event.mvcData.drawerProperties.lineWidth;
                        if (!range) {
                            range = this.page.slider
                                             .find('input[data-type="range"]');
                        }
                    },
                    pageshow: function () {
                        range.val(width)
                             .slider('refresh');
                    },
                    pagebeforehide: function (event) {
                        event.mvcData.method = 'setLineWidth';
                        event.mvcData.methodArguments = [
                            range.val()
                        ];
                    }
                });
            }()),
            // color page
            color: (function () {
                var color,
                    translate = function () {
                        this.page.title = l('%color.title');
                    };

                return mvc.controller({
                    page: {
                        title: ''
                    },
                    model: {
                        colors: null
                    },
                    selectedColorCode: '',
                    pagebeforecreate: function (event, callback) {
                        this.model.colors = colors;
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        color = null;
                        this.selectedColorCode =
                            event.mvcData.drawerProperties.strokeStyle;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    pagebeforehide: function (event) {
                        if (color) {
                            event.mvcData.method = 'setStyle';
                            event.mvcData.methodArguments = [
                                color
                            ];
                        }
                    },
                    setColor: function (event, callback, colorCode) {
                        color = colorCode;
                        window.history.back();
                    }
                });
            }()),
            // history page
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
                        histories: []
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        historyIndex = null;
                        this.model.histories = event.mvcData.drawerHistories;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    pagebeforehide: function (event) {
                        if (historyIndex !== null) {
                            event.mvcData.method = 'setHistory';
                            event.mvcData.methodArguments = [
                                historyIndex
                            ];
                        }
                    },
                    setHistoryIndex: function (event, callback, index) {
                        historyIndex = index;
                        $.mobile.changePage('#main', {
                            transition: 'fade',
                            reverse: true
                        });
                    }
                });
            }()),
            // language page
            language: (function () {
                var translate = function () {
                    this.page.title = l('%language.title');
                    this.page.information = l('%language.information');
                    this.model.languages = [{
                        code: 'xx-XX',
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
                        languages: null
                    },
                    selectedLanguageCode: '',
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        this.selectedLanguageCode = (settings.locale === '') ?
                            "xx-XX" : 
                            settings.locale;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    setLanguage: function (event, callback, languageCode) {
                        settings.locale = (languageCode === 'xx-XX') ?
                            '' : 
                            languageCode;
                        window.history.back();
                    }
                });
            }()),
            // about page
            about: (function () {
                var translate = function () {
                    this.page.title = l('%about.title');
                    this.page.description = l('%about.description');
                    this.page.source = l('%about.source');
                };

                return mvc.controller({
                    page: {
                        title: '',
                        version: 'WebPaint 0.2.0',
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
        webPaint.start({
            pageEvents: [
                'pagebeforecreate',
                'pagecreate',
                'pagebeforeshow',
                'pageshow',
                'pagebeforehide',
                'unload'
            ]
        });
    });
}(window.Mvc, window.drawing, window.jQuery));
