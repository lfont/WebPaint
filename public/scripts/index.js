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

    $.extend(mvc.components, {
        colorPicker: (function () {
            var SELECTED_CLASS = "colorpicker-color-selected",
                translate = function (model) {
                    model.customColorHint = l("%colorPicker.customColorHint");
                    model.predefinedColorHint =
                        l("%colorPicker.predefinedColorHint");
                    model.redLabel = l("%colorPicker.redLabel");
                    model.greenLabel = l("%colorPicker.greenLabel");
                    model.blueLabel = l("%colorPicker.blueLabel");
                },
                hexFromRgb = function (r, g, b) {
                    var hex = [
                            parseInt(r, 10).toString(16),
                            parseInt(g, 10).toString(16),
                            parseInt(b, 10).toString(16)
                        ];

                    $.each(hex, function (nr, val) {
                        if (val.length === 1) {
                            hex[nr] = "0" + val;
                        }
                    });

                    return "#" + hex.join("");
                },
                rgbFromHex = function (hex) {
                    var match = /([\da-f]{2})([\da-f]{2})([\da-f]{2})/
                        .exec(hex);
                    
                    if (match && match.length === 4) {
                        return {
                            r: parseInt(match[1], 16),
                            g: parseInt(match[2], 16),
                            b: parseInt(match[3], 16)
                        };
                    }
                    
                    return null;
                },
                getColorChangeHandler = function (colorPicker) {
                    return function () {
                        colorPicker.customColor
                            .removeClass(SELECTED_CLASS)
                            .css("background-color",
                                hexFromRgb(colorPicker.red.val(),
                                    colorPicker.green.val(),
                                    colorPicker.blue.val())); 
                    };
                };

            return function () {
                var hasPendingRendering = true,
                    model = {
                        selectedColor: null
                    },
                    changeCallbacks = [];
    
                return {
                    customColor: null,
                    red: null,
                    green: null,
                    blue: null,
                    pagebeforecreate: function () {
                        var colorChangeHandler;
                        
                        translate(model);
                        this.render(this, model);
                        colorChangeHandler = getColorChangeHandler(this);
                        this.red.change(colorChangeHandler);
                        this.green.change(colorChangeHandler);
                        this.blue.change(colorChangeHandler).change();
                    },
                    pagebeforeshow: function () {
                        if (hasPendingRendering) {
                            this.render("cpPredefinedColors", model);
                            hasPendingRendering = false;
                        }
                    },
                    colors: function (colrs) {
                        if (colrs) {
                            model.colors = colrs;
                            hasPendingRendering = true;
                        }
                        return model.colors;
                    },
                    hasPredefinedColor: function (color) {
                        var contains = false;
                        
                        $.each(model.colors, function (nr, val) {
                            if (val.code === color) {
                                contains = true;
                                return false;
                            }
                        });
                        
                        return contains;
                    },
                    select: function (color) {
                        var rgb;
                        
                        model.selectedColor = color;
                        if (this.hasPredefinedColor(color)) {
                            this.customColor.removeClass(SELECTED_CLASS);
                        } else {
                            rgb = rgbFromHex(color);
                            this.red.val(rgb.r).slider("refresh");
                            this.green.val(rgb.g).slider("refresh");
                            this.blue.val(rgb.b).slider("refresh").change();
                            this.customColor.addClass(SELECTED_CLASS);
                        }
                        hasPendingRendering = true;
                        return this;
                    },
                    change: function (callback) {
                        if (callback && typeof(callback) === "function") {
                            changeCallbacks.push(callback);
                        } else {
                            for (var i = 0; i < changeCallbacks.length;
                                i += 1) {
                                changeCallbacks[i].call(this);
                            }
                        }
                        return this;
                    },
                    value: function (req) {
                        var color;
    
                        if (req) {
                            color = req.get("color");
                            if (color === "custom") {
                                color = hexFromRgb(this.red.val(),
                                    this.green.val(), this.blue.val());
                                this.customColor.addClass(SELECTED_CLASS);
                            } else {
                                this.customColor.removeClass(SELECTED_CLASS);
                            }
                            model.selectedColor = color;
                            this.render("cpPredefinedColors", model);
                            this.change();
                        }
                        return model.selectedColor;
                    }
                };
            };
        }())
    });

    webPaint.controller("#main", (function () {
        var drawer,
            eventShapeDrawer,
            model = {},
            translate = function (model) {
                model.title = l("%main.title");
                model.undoButton = l("%main.undoButton");
                model.redoButton = l("%main.redoButton");
                model.toolsButton = l("%main.toolsButton");
                model.optionsButton = l("%main.optionsButton");
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
                    histories: [],
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
                    drawer.newDrawing(backgroundColor);
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
                    eventShapeDrawer.draw(kind);
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
            pagebeforecreate: function () {
                console.log("Loading WebPaint...");

                loadSettings();
                if (settings.locale) {
                    String.locale = settings.locale;
                }

                translate(model);
                this.render("pagebeforecreate", model);
            },
            pageshow: function () {
                if (drawer) {
                    return;
                }
                
                fixContentGeometry.call(this);
                fixCanvasGeometry.call(this);
                
                drawer = drawing.canvasDrawer(this.canvas[0]);
                eventShapeDrawer = drawer.eventShapeDrawer({
                    events: {
                        down: "vmousedown",
                        up: "vmouseup",
                        move: "vmousemove"
                    }
                });

                if (settings.drawer.histories.length) {
                    drawer.newDrawing(settings.drawer.backgroundColor);
                    drawer.properties(settings.drawer.properties);
                    drawer.histories(settings.drawer.histories);
                    actions.setHistory(settings.drawer.history);
                    actions.setShape(settings.drawer.shape);
                } else {
                    actions.newDrawing();
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

    webPaint.controller("#tools", (function () {
        var actions,
            drawer,
            model = {},
            translate = function (model) {
                model.title = l("%tools.title");
                model.shapeLabel = l("%tools.shapeLabel");
                model.widthLabel = l("%tools.widthLabel");
                model.colorLabel = l("%tools.colorLabel");
                model.pencilLabel = l("%tools.pencilLabel");
                model.lineLabel = l("%tools.lineLabel");
                model.rectangleLabel = l("%tools.rectangleLabel");
                model.circleLabel = l("%tools.circleLabel");
            };

        return {
            shape: null,
            width: null,
            components: [
                { name: "colorPicker", alias: "cPicker" }
            ],
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
                this.component("cPicker").change(function () {
                    actions.setColor(this.value());
                }).colors(colors.slice(1));
            },
            pagebeforeshow: function (req) {
                actions = req.get("actions");
                drawer = req.get("drawer");
                this.component("cPicker").select(drawer.properties.strokeStyle);
            },
            pageshow: function () {
                this.shape.find("input[value='" + drawer.shape + "']")
                    .attr("checked", true).checkboxradio("refresh");
                this.width.val(drawer.properties.lineWidth).slider("refresh");
            },
            pagebeforehide: function () {
                actions.setShape(this.shape.find("input:checked").val());
                actions.setLineWidth(parseInt(this.width.val(), 10));
            }
        };
    }()));
    
    webPaint.controller("#options", (function () {
        var data,
            model = {},
            translate = function (model) {
                model.title = l("%options.title");
                model.options = [{
                    link: "#newDrawing",
                    name: l("%options.new")
                }, {
                    method: {
                        name: "callAction",
                        param: "saveAs"
                    },
                    name: l("%options.saveAs")
                }, {
                    method: {
                        name: "callAction",
                        param: "clear"
                    },
                    name: l("%options.clear")
                }, {
                    link: "#history",
                    name: l("%options.history")
                }, {
                    link: "#language",
                    name: l("%options.language")
                }, {
                    link: "#about",
                    name: l("%options.about")
                }];
            };

        return {
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
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
                model.background = l("%newDrawing.background");
            };

        return {
            components: [
                { name: "colorPicker", alias: "cPicker" }
            ],
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
                this.component("cPicker").change(function () {
                    actions.newDrawing(this.value());
                    navigator.goBackTo("#main");
                }).colors(colors);
            },
            pagebeforeshow: function (req) {
                actions = req.get("actions");
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
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req) {
                var drawer = req.get("drawer");

                actions = req.get("actions");
                model.histories = drawer.histories;
                model.history = drawer.history;
                this.render("pagebeforeshow", model).trigger("create");
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
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
            },
            pagebeforeshow: function (req) {
                var appLocale = req.get("locale");

                actions = req.get("actions");
                model.locale = (appLocale === "") ?
                    DEFAULT_LOCALE :
                    appLocale;
                this.render("pagebeforeshow", model).trigger("create");
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
                version: "WebPaint 0.4.3"
            },
            translate = function (model) {
                model.title = l("%about.title");
                model.description = l("%about.description");
                model.source = l("%about.source");
                model.follow = l("%about.follow");
            };

        return {
            pagebeforecreate: function () {
                translate(model);
                this.render("pagebeforecreate", model);
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
