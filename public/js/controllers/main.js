define([
   "jquery",
   "drawing",
   "context",
   "lib/drawing.event"
], function ($, drawing, context) {
    var drawer,
        eventShapeDrawer,
        model = {},
        translate = function (m) {
            m.title = context.l("%main.title");
            m.undoButton = context.l("%main.undoButton");
            m.redoButton = context.l("%main.redoButton");
            m.toolsButton = context.l("%main.toolsButton");
            m.optionsButton = context.l("%main.optionsButton");
            m.lastUndo = context.l("%main.lastUndo");
            m.lastRedo = context.l("%main.lastRedo");

            $.mobile.page.prototype.options.backBtnText = context.l("%backButton");
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
        fixContentGeometry = function ($header, $content) {
            var contentHeight = $(window).height() - $header.outerHeight();

            contentHeight -= ($content.outerHeight() - $content.height());
            $content.height(contentHeight);
        },
        fixCanvasGeometry = function ($content, $canvas) {
            var canvas = $canvas[0];

            canvas.height = ($content.height() -
                ($canvas.outerHeight() - $canvas.height()));
            canvas.width = ($content.width() -
                ($canvas.outerWidth() - $canvas.width()));
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
            setShape: function (shapeName) {
                settings.drawer.shape = shapeName;
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
            if (!drawer) {
                fixContentGeometry(this.header, this.content);
                fixCanvasGeometry(this.content, this.canvas);
                
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
            }

            setTimeout(function () {
                eventShapeDrawer.on(settings.drawer.shape);
            }, 500);
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
            eventShapeDrawer.off();
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
});
