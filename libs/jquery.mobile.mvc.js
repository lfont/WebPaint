/*
Simple MVC library for jQuery Mobile
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

(function (window) {
    "use strict";
    var VIEW_ATTRIBUTE = "data-mvc-view",
        VIEW_ANCHOR_ATTRIBUTE = "data-mvc-view-anchor",
        COMMAND_ATTRIBUTE = "data-mvc-command",
        COMMAND_ARGUMENTS_ATTRIBUTE = "data-mvc-command-arguments",
        BINDING_ATTRIBUTE = "data-mvc-binding",
        $ = window.jQuery,
        Mvc = {},
        parseObjectAttribute = function (value) {
            var objs = [],
                obj = {},
                regex = /(\w+)[ :]+([\w.$]+)( *\})?/g,
                captures;

            while ((captures = regex.exec(value))) {
                obj[captures[1]] = captures[2];
                if (captures[3]) {
                    objs.push(obj);
                    obj = {};
                }
            }

            return objs;
        },
        viewEngine = function () {
            // Code Based on: Simple JavaScript Templating
            // John Resig - http://ejohn.org/ - MIT Licensed
            var cache = {},
                getHtml = function (viewAttribute) {
                    var view = parseObjectAttribute(viewAttribute)[0],
                        $views = $("[" + VIEW_ATTRIBUTE + "*='name: " + view.name  + "']");

                    if ($views.length > 1) {
                        // If there are many views with the same name, we take the one that is
                        // specific to the given page.
                        return $views.filter("[" + VIEW_ATTRIBUTE + "*='page: " + view.page  + "']")
                                     .html();
                    }

                    return $views.html();
                },
                tmpl = function tmpl (str, data) {
                    // Figure out if we're getting a template, or if we need to
                    // load the template - and be sure to cache the result.
                    var fn = !/[^\w{}:, ]/.test(str) ?
                        cache[str] = cache[str] || tmpl(getHtml(str)) :

                        // Generate a reusable function that will serve as a template
                        // generator (and which will be cached).
                        new Function("obj",
                            "var p=[],print=function(){p.push.apply(p,arguments);};" +

                            // Introduce the data as local variables using with(){}
                            "with(obj){p.push('" +

                            // Convert the template into pure JavaScript
                            str
                                .replace(/[\r\t\n]/g, " ")
                                .split("<%").join("\t")
                                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                                .replace(/\t=(.*?)%>/g, "',$1,'")
                                .split("\t").join("');")
                                .split("%>").join("p.push('")
                                .split("\r").join("\\'") +
                            "');}return p.join('');");

                    // Provide some basic currying to the user
                    return data ? fn( data ) : fn;
                };

            return function () {
                return {
                    render: tmpl
                };
            };
        },
        controller = function () {
            var render = function (controller, viewEngine) {
                return function (viewName) {
                    return {
                        name: viewName,
                        content: viewEngine.render(
                            "{ page: " + controller.pageId + ", name: " + viewName + " }",
                            controller)
                    };
                };
            };

            return function (controller, viewEngine) {
                var engine = viewEngine ?
                    viewEngine : Mvc.viewEngine();

                controller.renderView = render(controller, engine);
                return controller;
            };
        },
        application = function () {
            var defaultOptions = {
                    pageEvents: [ "pagebeforecreate" ]
                },
                // Deeply search for a property of an object by is name.
                // this method can resolve property like: obj.property1[.property2[n]]
                getObjectProperty = function (object, name) {
                    var propertiesNames = name.split("."),
                        propertyNameIndex,
                        propertyName,
                        property = object;

                    for (propertyNameIndex = 0; propertyNameIndex < propertiesNames.length;
                        propertyNameIndex += 1) {
                        propertyName = propertiesNames[propertyNameIndex];
                        if (!property.hasOwnProperty(propertyName)) {
                            return null;
                        }
                        if (propertyNameIndex + 1 < propertiesNames.length) {
                            property = property[propertyName];
                        }
                    }

                    // This function return the root variable (entryPoint) of the final property,
                    // because if the property is a value type this allow us to update the value.
                    return {
                        // entryPoint[name] is the final property.
                        entryPoint: property,
                        name: propertyName
                    };
                },
                bindEvent = function (controller, $element, command, actionCallback) {
                    var property = getObjectProperty(controller, command.method);

                    if (!property) {
                        if (command.isRequired) {
                            console.warn("bindEvent - unknown method: " + command.method +
                                " on element: " + $element.attr("id"));
                        }
                        return;
                    }

                    if (typeof(property.entryPoint[property.name]) !== "function") {
                        console.warn("bindEvent - property: " + command.method +
                            " is not a valid method on element: " + $element.attr("id"));
                        return;
                    }

                    $element.bind(command.event, actionCallback(property));
                },
                bindProperty = function (controller, $element, binding) {
                    var property = getObjectProperty(controller, binding.property);

                    if (!property) {
                        console.warn("bindProperty - unknown property: " +
                            binding.property + " on element: " + $element.attr("id"));
                        return;
                    }

                    switch (binding.type) {
                        case "value":
                            property.entryPoint[property.name] = $element.val();
                            break;
                        case "text":
                            property.entryPoint[property.name] = $element.text();
                            break;
                        case "object":
                            property.entryPoint[property.name] = $element;
                            break;
                        default:
                            console.warn("bindProperty - unknown bindingType: " + binding.type +
                                " on element: " + $element.attr("id"));
                    }
                },
                createRenderViewCallback = function (controller, $page) {
                    return function (view) {
                        return renderView(controller, $page, view);
                    };
                },
                renderView = function (controller, $page, view) {
                    var $view = $page.find("[" + VIEW_ANCHOR_ATTRIBUTE + "='" + view.name + "']"),
                        renderViewCallback = createRenderViewCallback(controller, $page),
                        bindProperties = function (predicate) {
                            $view.find("[" + BINDING_ATTRIBUTE + "]").each(function () {
                                var $element = $(this),
                                    binding = parseObjectAttribute($element.attr(BINDING_ATTRIBUTE))[0];

                                if (predicate(binding)) {
                                    bindProperty(controller, $element, binding);
                                }
                            });
                        };

                    if (!$view.length) {
                        // If there's no anchor for the given view, the view is rendered inside
                        // the page.
                        $view = $page;
                    }

                    $view.empty()
                         .append(view.content)
                         .find("[" + COMMAND_ATTRIBUTE + "]").each(function () {
                            var $element = $(this),
                                commands = parseObjectAttribute($element.attr(COMMAND_ATTRIBUTE)),
                                commandIndex,
                                commandArgumentsAttribute = $element.attr(COMMAND_ARGUMENTS_ATTRIBUTE),
                                commandArguments;

                                if (commandArgumentsAttribute) {
                                    // Command's arguments are going to be pass to the method...
                                    commandArguments = commandArgumentsAttribute.split(',');
                                }

                            for (commandIndex = 0; commandIndex < commands.length; commandIndex += 1) {
                                (function () {
                                    var command = commands[commandIndex];
                                    command.isRequired = true;
                                    bindEvent(controller, $element, command, function (property) {
                                        return function (event) {
                                            var actionArguments = [];

                                            bindProperties(function (binding) {
                                                // When an event occur the dom objects are not supposed
                                                // to have changed, so we don't waste time to rebind them.
                                                return (binding.type !== "object");
                                            });
                                            actionArguments.push(event);
                                            actionArguments.push(renderViewCallback);
                                            if (commandArguments) {
                                                actionArguments = actionArguments.concat(commandArguments);
                                            }
                                            property.entryPoint[property.name].apply(controller,
                                                actionArguments);
                                        };
                                    });
                                }());
                            }
                         });

                    bindProperties(function (binding) {
                        // Values has just been written to the view and
                        // they still have the same value in the controller,
                        // so we don't waste time to rebind them.
                        return (binding.type === "object");
                    });

                    return $view;
                },
                start = function (appOptions) {
                    var pageId,
                        $page,
                        controller,
                        eventIndex,
                        mvcData = {},
                        renderViewCallback,
                        // Set the application's options to the defaults.
                        options = $.extend({}, defaultOptions, appOptions);

                    for (pageId in this.controllers) {
                        if (this.controllers.hasOwnProperty(pageId)) {
                            $page = $("#" + pageId);
                            controller = this.controllers[pageId];
                            renderViewCallback = createRenderViewCallback(controller, $page);
                            for (eventIndex = 0; eventIndex < options.pageEvents.length;
                                eventIndex += 1) {
                                (function () {
                                    var $p = $page,
                                        ctrl = controller,
                                        command = {
                                            event: options.pageEvents[eventIndex],
                                            method: options.pageEvents[eventIndex],
                                            isRequired: false
                                        },
                                        callback = renderViewCallback;

                                    ctrl.pageId = pageId;
                                    bindEvent(ctrl, $p, command, function (property) {
                                        if (command.event === "pagebeforehide" ||
                                            command.event === "pagehide") {
                                            return function (event) {
                                                // Initialize the shared object so
                                                // page*show have a fresh reference to deals with.
                                                mvcData = {};
                                                event.mvcData = mvcData;
                                                property.entryPoint[property.name](event, callback);
                                            };
                                        } else if (command.event === "pagebeforeshow" ||
                                            command.event === "pageshow") {
                                            return function (event) {
                                                // Pass the shared objet that has been
                                                // initialized by the page*hide event.
                                                event.mvcData = mvcData;
                                                property.entryPoint[property.name](event, callback);
                                            };
                                        } else {
                                            return function (event) {
                                                property.entryPoint[property.name](event, callback);
                                            };
                                        }
                                    });
                                }());
                            }
                        }
                    }
                };

            return function (controllers) {
                return {
                    controllers: controllers,
                    start: start
                };
            };
        };

    if (typeof(window.Mvc) !== "object") {
        Mvc.application = application();
        Mvc.controller = controller();
        Mvc.viewEngine = viewEngine();
        window.Mvc = Mvc;
    }
}(window));
