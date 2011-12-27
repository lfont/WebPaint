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
        navigator = {
            goBackTo: function (pageName) {
                $.mobile.changePage(pageName, {
                    transition: 'fade',
                    reverse: true
                });
            }
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
                        this.page.shapeButton = l('%main.shapeButton');
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
                        
                        $.mobile.page.prototype.options.backBtnText =
                            l('%backButton');
                    },
                    // settings
                    SETTINGS_STORAGE_KEY = 'settings',
                    defaultSettings = {
                        locale: '',
                        drawer: {
                            shape: 'pencil',
                            properties: {
                                strokeStyle: '#000000',
                                fillStyle: '#000000',
                                lineWidth: 1,
                                lineCap: 'round'
                            }
                        }
                    },
                    settings = {},
                    loadSettings = function () {
                        var settingsString = localStorage
                                .getItem(SETTINGS_STORAGE_KEY),
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
                    },
                    // actions
                    actions = {
                        clear: function () {
                            drawer.clear();
                        },
                        newDrawing: function (backgroundColor) {
                            drawer.init(backgroundColor);
                            this.setShape(defaultSettings.drawer.shape);
                        },
                        saveAs: function () {
                            drawer.saveAs();
                        },
                        setLineWidth: function (width) {
                            drawer.properties({
                                lineWidth: width
                            });
                        },
                        setColor: function (color) {
                            drawer.properties({
                                strokeStyle: color,
                                fillStyle: color
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
                        }
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
                        console.log('Loading WebPaint...');
                        
                        loadSettings();
                        if (settings.locale) {
                            String.locale = settings.locale;
                        }
                                
                        $.mobile.page.prototype.options.addBackBtn = true;
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function () {
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
                            
                            if (settings.drawer.histories.length) {
                                actions.setHistory(settings.drawer.history);
                                actions.setShape(settings.drawer.shape);
                            }
                            else {
                                actions.newDrawing();
                            }
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
                        event.mvcData.actions = actions;
                        event.mvcData.locale = settings.locale;
                        event.mvcData.drawer = {
                            properties: drawer.properties(),
                            histories: drawer.histories(),
                            history: drawer.history(),
                            shape: settings.drawer.shape
                        };
                    },
                    unload: function () {
                        var histories = drawer.histories(),
                            history = drawer.history();
                        
                        console.log('Unloading WebPaint...');
                        settings.drawer.properties = drawer.properties();
                        settings.drawer.histories = (histories.length > 10) ?
                            histories.slice(histories.length - 10) :
                            histories;
                        settings.drawer.history = (history >=
                            settings.drawer.histories.length) ?
                            settings.drawer.histories.length - 1 :
                            history;
                        storeSettings();
                    },
                    undo: function (event) {
                        event.preventDefault();
                        drawer.undo();
                    },
                    redo: function (event) {
                        event.preventDefault();
                        drawer.redo();
                    }
                });
            }()),
            // option controller
            option: (function () {
                var mvcData,
                    translate = function () {
                        this.page.title = l('%option.title');
                        this.model.options = [{
                            link: '#newDrawing',
                            name: l('%option.new')
                        }, {
                            method: {
                                name: 'callAction',
                                args: 'saveAs'
                            },            
                            name: l('%option.saveAs')
                        }, {
                            method: {
                                name: 'callAction',
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
                        if (event.mvcData.actions) {
                            mvcData = event.mvcData;
                        }
                    },
                    pagebeforehide: function (event) {
                        event.mvcData.actions = mvcData.actions;
                        event.mvcData.locale = mvcData.locale;
                        event.mvcData.drawer = mvcData.drawer;
                    },
                    callAction: function (event, callback, name) {
                        mvcData.actions[name]();
                        navigator.goBackTo('#main');
                    }
                });
            }()),
            // newDrawing controller
            newDrawing: (function () {
                var actions,
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
                    pagebeforeshow: function (event) {
                        actions = event.mvcData.actions;
                    },
                    setColor: function (event, callback, backgroundColor) {
                        actions.newDrawing(backgroundColor);
                        navigator.goBackTo('#main');
                    }
                });
            }()),
            // shape controller
            shape: (function () {
                var actions,
                    shapeKind,
                    lineWidth,
                    translate = function () {
                        this.page.title = l('%shape.title');
                        this.page.sliderLabel = l('%shape.sliderLabel');
                        this.page.shapeLabel = l('%shape.shapeLabel');
                        this.page.pencilLabel = l('%shape.pencilLabel');
                        this.page.lineLabel = l('%shape.lineLabel');
                        this.page.rectangleLabel = l('%shape.rectangleLabel');
                        this.page.circleLabel = l('%shape.circleLabel');
                    };
                    
                return mvc.controller({
                    page: {
                        title: '',
                        sliderLabel: '',
                        shape: null,
                        range: null
                    },
                    pagebeforecreate: function (event, callback) {
                        translate.call(this);
                        callback(this.renderView('pagebeforecreate'));
                    },
                    pagebeforeshow: function (event, callback) {
                        actions = event.mvcData.actions;
                        shapeKind = event.mvcData.drawer.shape;
                        lineWidth = event.mvcData.drawer.properties.lineWidth;
                    },
                    pageshow: function () {
                        this.page.shape.find('input[value="' + shapeKind + '"]')
                            .attr('checked', true).checkboxradio('refresh');
                        this.page.range.val(lineWidth).slider('refresh');
                    },
                    pagebeforehide: function (event) {
                        actions.setShape(this.page.shape.find('input:checked')
                            .val());
                        actions.setLineWidth(
                            parseInt(this.page.range.val(), 10));
                    }
                });
            }()),
            // color controller
            color: (function () {
                var actions,
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
                        actions = event.mvcData.actions;
                        this.model.color = event.mvcData.drawer
                            .properties.strokeStyle;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    setColor: function (event, callback, color) {
                        actions.setColor(color);
                        navigator.goBackTo('#main');
                    }
                });
            }()),
            // history controller
            history: (function () {
                var actions,
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
                        actions = event.mvcData.actions;
                        this.model.histories = event.mvcData.drawer.histories;
                        this.model.history = event.mvcData.drawer.history;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    setHistory: function (event, callback, index) {
                        actions.setHistory(parseInt(index, 10));
                        navigator.goBackTo('#main');
                    }
                });
            }()),
            // language controller
            language: (function () {
                var actions,
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
                        actions = event.mvcData.actions;
                        this.model.locale =
                            (event.mvcData.locale === '') ?
                                DEFAULT_LOCALE :
                                event.mvcData.locale;
                        callback(this.renderView('pagebeforeshow'))
                            .trigger('create');
                    },
                    setLocale: function (event, callback, locale) {
                        locale = (locale === DEFAULT_LOCALE) ?
                            '' :
                            locale;
                        actions.setLocale(locale);
                        navigator.goBackTo('#main');
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
                        version: 'WebPaint 0.2.1',
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
