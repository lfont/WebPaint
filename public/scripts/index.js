/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function ($, mvc, drawing) {
    "use strict";
    var colors,
        // localization
        l = function (string) {
            return string.toLocaleString();
        },
        // navigation
        navigator = {
            goBackTo: function (pageName) {
                $.mobile.changePage(pageName, {
                    reverse: true
                });
            }
        },
        // application
        webPaint = mvc.application();
    
    webPaint.controller("#main", (function () {
        var isInitialized = false,
            drawer,
            model = {},
            translate = function (model) {
                model.title = l("%main.title");
                model.undoButton = l("%main.undoButton");
                model.redoButton = l("%main.redoButton");
                model.shapeButton = l("%main.shapeButton");
                model.colorButton = l("%main.colorButton");
                model.optionButton = l("%main.optionButton");
                model.lastUndo = l("%main.lastUndo");
                model.lastRedo = l("%main.lastRedo");
                
                colors = [{
                    code: "transparent",
                    name: l("%transparent")
                }, {
                    code: "#000000",
                    name: l("%black")
                }, {
                    code: "#d2691e",
                    name: l("%chocolate")
                }, {
                    code: "#ffffff",
                    name: l("%white")
                }, {
                    code: "#ffc0cb",
                    name: l("%pink")
                }, {
                    code: "#ff0000",
                    name: l("%red")
                }, {
                    code: "#ffa500",
                    name: l("%orange")
                }, {
                    code: "#ee82ee",
                    name: l("%violet")
                }, {
                    code: "#0000ff",
                    name: l("%blue")
                }, {
                    code: "#40e0d0",
                    name: l("%turquoise")
                }, {
                    code: "#008000",
                    name: l("%green")
                }, {
                    code: "#ffff00",
                    name: l("%yellow")
                }];
                
                $.mobile.page.prototype.options.backBtnText = l("%backButton");
            },
            // settings
            SETTINGS_STORAGE_KEY = "settings",
            defaultSettings = {
                locale: "",
                drawer: {
                    shape: "pencil",
                    properties: {
                        strokeStyle: "#000000",
                        fillStyle: "#000000",
                        lineWidth: 1,
                        lineCap: "round"
                    }
                }
            },
            settings = {},
            loadSettings = function () {
                var settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY),
                    userSettings;
                    
                if (settingsString) {
                    try {
                        userSettings = JSON.parse(settingsString);
                        $.extend(settings, defaultSettings, userSettings);
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
                        this.header.outerHeight() -
                        (this.footer && this.footer.outerHeight() || 0);
                        
                contentHeight -= (this.content.outerHeight() -
                    this.content.height());
                this.content.height(contentHeight);
            },
            fixCanvasGeometry = function () {
                var canvas = this.canvas[0];
                
                canvas.height = (this.content.height() -
                    (this.canvas.outerHeight() -
                        this.canvas.height()));
                canvas.width = (this.content.width() -
                    (this.canvas.outerWidth() -
                        this.canvas.width()));
            },
            // actions
            actions = {
                clear: function () {
                    drawer.clear().store();
                },
                newDrawing: function (backgroundColor) {
                    settings.drawer.backgroundColor = backgroundColor;
                    drawer.init(backgroundColor);
                    this.setShape(defaultSettings.drawer.shape);
                },
                saveAs: function () {
                    $.mobile.download("/service/saveAs/drawing.png", "POST", {
                        dataURL: drawer.histories()[drawer.history()]
                    });
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
            
        return {
            header: null,
            content: null,
            canvas: null,
            pagebeforecreate: function (req, res) {
                console.log("Loading WebPaint...");
                
                loadSettings();
                if (settings.locale) {
                    String.locale = settings.locale;
                }
                
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function () {
                if (!drawer) {
                    drawer = drawing.canvasDrawer(this.canvas[0]);
                    drawing.canvasDrawerEventWrapper(drawer, {
                        events: {
                            down: "vmousedown",
                            up: "vmouseup",
                            move: "vmousemove"
                        }
                    });
                    
                    if (settings.drawer.histories.length) {
                        drawer.init(settings.drawer.backgroundColor);
                        drawer.properties(settings.drawer.properties);
                        drawer.histories(settings.drawer.histories);
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
            pagebeforehide: function (req, res) {
                res.send("actions", actions);
                res.send("locale", settings.locale);
                res.send("drawer", {
                    properties: drawer.properties(),
                    histories: drawer.histories(),
                    history: drawer.history(),
                    shape: settings.drawer.shape
                });
            },
            unload: function () {
                var histories = drawer.histories(),
                    history = drawer.history();
                
                console.log("Unloading WebPaint...");
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
            undo: function (req) {
                req.event.preventDefault();
                if (!drawer.undo()) {
                    $.mobile.showToast(model.lastUndo);
                }
            },
            redo: function (req) {
                req.event.preventDefault();
                if (!drawer.redo()) {
                    $.mobile.showToast(model.lastRedo);
                }
            }
        };
    }()));
    
    webPaint.controller("#option", (function () {
        var data,
            model = {},
            translate = function (model) {
                model.title = l("%option.title");
                model.options = [{
                    link: "#newDrawing",
                    name: l("%option.new")
                }, {
                    method: {
                        name: "callAction",
                        param: "saveAs"
                    },            
                    name: l("%option.saveAs")
                }, {
                    method: {
                        name: "callAction",
                        param: "clear"
                    },
                    name: l("%option.clear")
                }, {
                    link: "#history",
                    name: l("%option.history")
                }, {
                    link: "#language",
                    name: l("%option.language")
                }, {
                    link: "#about",
                    name: l("%option.about")
                }];
            };
            
        return {
            pagebeforecreate: function (req, res) {
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req) {
                if (req.get("actions")) {
                    // the previous page was "#main"
                    data = req.get();
                }
            },
            pagebeforehide: function (req, res) {
                res.send(data);
            },
            callAction: function (req) {
                data.actions[req.get("name")]();
                navigator.goBackTo("#main");
            }
        };
    }()));
    
    webPaint.controller("#newDrawing", (function () {
        var actions,
            model = {},
            translate = function (model) {
                model.title = l("%newDrawing.title");
            };
            
        return {
            pagebeforecreate: function (req, res) {
                model.colors = colors;
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req) {
                actions = req.get("actions");
            },
            setColor: function (req) {
                actions.newDrawing(req.get("code"));
                navigator.goBackTo("#main");
            }
        };
    }()));
    
    webPaint.controller("#shape", (function () {
        var actions,
            drawer,
            model = {},
            translate = function (model) {
                model.title = l("%shape.title");
                model.sliderLabel = l("%shape.sliderLabel");
                model.shapeLabel = l("%shape.shapeLabel");
                model.pencilLabel = l("%shape.pencilLabel");
                model.lineLabel = l("%shape.lineLabel");
                model.rectangleLabel = l("%shape.rectangleLabel");
                model.circleLabel = l("%shape.circleLabel");
            };
            
        return {
            shape: null,
            range: null,
            pagebeforecreate: function (req, res) {
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req) {
                actions = req.get("actions");
                drawer = req.get("drawer");
            },
            pageshow: function () {
                this.shape.find("input[value='" + drawer.shape + "']")
                    .attr("checked", true).checkboxradio("refresh");
                this.range.val(drawer.properties.lineWidth).slider("refresh");
            },
            pagebeforehide: function () {
                actions.setShape(this.shape.find("input:checked").val());
                actions.setLineWidth(parseInt(this.range.val(), 10));
            }
        };
    }()));
    
    webPaint.controller("#color", (function () {
        var actions,
            model = {},
            translate = function (model) {
                model.title = l("%color.title");
            };
            
        return {
            pagebeforecreate: function (req, res) {
                model.colors = colors;
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req, res) {
                actions = req.get("actions");
                model.code = req.get("drawer").properties.strokeStyle;
                res.render("pagebeforeshow", model).trigger("create");
            },
            setColor: function (req) {
                actions.setColor(req.get("code"));
                navigator.goBackTo("#main");
            }
        };
    }()));
    
    webPaint.controller("#history", (function () {
        var actions,
            model = {},
            translate = function (model) {
                model.title = l("%history.title");
                model.historyLabel = l("%history.historyLabel");
            };
            
        return {
            pagebeforecreate: function (req, res) {
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req, res) {
                var drawer = req.get("drawer");
                
                actions = req.get("actions");
                model.histories = drawer.histories;
                model.history = drawer.history;
                res.render("pagebeforeshow", model).trigger("create");
            },
            setHistory: function (req) {
                actions.setHistory(parseInt(req.get("index"), 10));
                navigator.goBackTo("#main");
            }
        };
    }()));
        
    webPaint.controller("#language", (function () {
        var DEFAULT_LOCALE = "xx-XX",
            actions,
            model = {},
            translate = function (model) {
                model.title = l("%language.title");
                model.information = l("%language.information");
                model.languages = [{
                    code: DEFAULT_LOCALE,
                    name: l("%language.default")
                }, {
                    code: "en-US",
                    name: l("%language.english")
                }, {
                    code: "fr-FR",
                    name: l("%language.french")
                }];
            };
            
        return {
            pagebeforecreate: function (req, res) {
                translate(model);
                res.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req, res) {
                var appLocale = req.get("locale");
                
                actions = req.get("actions");
                model.locale = (appLocale === "") ?
                    DEFAULT_LOCALE :
                    appLocale;
                res.render("pagebeforeshow", model).trigger("create");
            },
            setLocale: function (req) {
                var locale = req.get("locale");
                
                locale = (locale === DEFAULT_LOCALE) ?
                    "" :
                    locale;
                actions.setLocale(locale);
                navigator.goBackTo("#main");
            }
        };
    }()));
        
    webPaint.controller("#about", (function () {
        var model = {
                version: "WebPaint 0.3.1"
            },
            translate = function (model) {
                model.title = l("%about.title");
                model.description = l("%about.description");
                model.source = l("%about.source");
                model.follow = l("%about.follow");
            };
            
        return {
            pagebeforecreate: function (req, res) {
                translate(model);
                res.render("pagebeforecreate", model);
            }
        };
    }()));
        
    webPaint.stop(function () {
        this.controller("#main").unload();
    });
        
    $(document).bind("mobileinit", function () {
        $.mobile.defaultPageTransition = "none";
        $.mobile.defaultDialogTransition = "none";
        $.mobile.page.prototype.options.addBackBtn = true;                
    });
}(window.jQuery, window.jqmMvc, window.drawing));
