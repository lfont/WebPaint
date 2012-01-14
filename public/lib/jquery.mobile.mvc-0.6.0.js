/*
Simple MVC library for jQuery Mobile
Loïc Fontaine - http://github.com/lfont - MIT Licensed

The compile function is base on: Simple JavaScript Templating
John Resig - http://ejohn.org/ - MIT Licensed
*/

(function ($) {
    "use strict";
    var VIEW_ATTRIBUTE = "data-mvc-view",
        VIEW_ANCHOR_ATTRIBUTE = "data-mvc-view-anchor",
        COMMAND_ATTRIBUTE = "data-mvc-command",
        BINDING_ATTRIBUTE = "data-mvc-binding",
        defaultOptions = {
            pageEvents: [
                "pagebeforecreate",
                "pagecreate",
                "pagebeforeshow",
                "pageshow",
                "pagebeforehide",
                "pagehide"
            ]
        },
        // helpers
        parseObjectAttribute = function (value) {
            var objs = [],
                obj = {},
                regex = /([\w\-]+)[ :]+([\w.\-$#@]+)( *\})?/g,
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
        // Deeply search for a property of an object by is name.
        // this method can resolve property like: obj.property1[.property2[n]]
        getObjectProperty = function (object, name) {
            var propertiesNames = name.split("."),
                propertyNameIndex, propertyName, property = object;

            for (propertyNameIndex = 0;
                propertyNameIndex < propertiesNames.length;
                propertyNameIndex += 1) {
                propertyName = propertiesNames[propertyNameIndex];
                if (!property.hasOwnProperty(propertyName)) {
                    return null;
                }
                if (propertyNameIndex + 1 < propertiesNames.length) {
                    property = property[propertyName];
                }
            }

            // This function return the root variable (entryPoint) of the 
            // final property, because if the property is a value type this 
            // allow us to update the value.
            return {
                // entryPoint[name] is the final property.
                entryPoint: property,
                name: propertyName
            };
        },
        bindEvent = function (controller, command, callback) {
            var property = getObjectProperty(controller, command.method);

            if (!property) {
                if (command.isRequired) {
                    console.warn("bindEvent - unknown method: " +
                        command.method + " on element: " +
                        command.element.attr("id"));
                }
                return;
            }

            if (typeof (property.entryPoint[property.name]) !== "function") {
                console.warn("bindEvent - property: " + command.method +
                    " is not a valid method on element: " +
                    command.element.attr("id"));
                return;
            }

            command.element.bind(command.event, callback(property));
        },
        bindProperty = function (controller, binding) {
            var property = getObjectProperty(controller, binding.property);

            if (!property) {
                console.warn("bindProperty - unknown property: " +
                    binding.property + " on element: " +
                    binding.element.attr("id"));
                return;
            }

            switch (binding.type) {
            case "value":
                property.entryPoint[property.name] = binding.element.val();
                break;
            case "text":
                property.entryPoint[property.name] = binding.element.text();
                break;
            case "object":
                property.entryPoint[property.name] = binding.element;
                break;
            default:
                console.warn("bindProperty - unknown bindingType: " + 
                    binding.type + " on element: " +
                    binding.element.attr("id"));
            }
        },
        // command arguments
        getRequestObject = function (event, ui, getDataCallback) {
            var data,
                request = {
                    event: event
                };
            
            if (ui) {
                request.ui = ui;
            }
            
            if (getDataCallback) {
                request.get = function (key) {
                    if (!data) {
                        data = getDataCallback();
                    }
                    
                    return key ? data[key] : data;
                };
            }
            
            return request;
        },
        getResponseObject = function (renderingCallback, data) {
            var response = {
                render: renderingCallback
            };
            
            if (data) {
                response.send = function (key, value) {
                    if (typeof(key) === "object") {
                        $.extend(data, key);
                    } else {
                        data[key] = value;
                    }
                };
            }
            
            return response;
        },
        // view rendering
        bindPropertiesToController = function (controller, view, predicate) {
            view.find("[" + BINDING_ATTRIBUTE + "]").each(function () {
                var element = $(this),
                    binding = parseObjectAttribute(
                        element.attr(BINDING_ATTRIBUTE))[0];

                if (predicate(binding)) {
                    binding.element = element;
                    bindProperty(controller, binding);
                }
            });
        },
        bindCommandToController = function (controller, view, command,
            renderingCallback) {
            command.isRequired = true;
                            
            bindEvent(controller, command,
                function (property) {
                    var handler = property.entryPoint[property.name];
                    
                    return function (event) {
                        bindPropertiesToController(controller, view,
                            function (binding) {
                                // When an event occur the dom objects are not
                                // supposed to have changed, so we don't waste 
                                // time to rebind them.
                                return (binding.type !== "object");
                            });
                        
                        handler.call(controller,
                            getRequestObject(event, null, function () {
                                    var data = {};
                                    
                                    for (property in command) {
                                        if (!command.hasOwnProperty(property)) {
                                            continue;
                                        }
                                        
                                        if (property.indexOf("param-") > -1) {
                                            data[property
                                                .replace("param-", "")] =
                                                    command[property];
                                        }
                                    }
                                    
                                    return data;
                                }),
                            getResponseObject(renderingCallback));
                    };
                });
        },
        renderTemplate = function (controller, template, renderingCallback) {
            var view = controller.page().find("[" + VIEW_ANCHOR_ATTRIBUTE +
                    "='" + template.name + "']");

            if (!view.length) {
                // If there's no anchor for the given view, the view is
                // rendered inside the page.
                view = controller.page();
            }

            view.empty()
                .append(template.html)
                .find("[" + COMMAND_ATTRIBUTE + "]")
                .each(function () {
                    var element = $(this),
                        commands = parseObjectAttribute(
                            element.attr(COMMAND_ATTRIBUTE)),
                        commandIndex,
                        command;
    
                    for (commandIndex = 0; commandIndex < commands.length;
                        commandIndex += 1) {
                        command = commands[commandIndex];
                        command.element = element;
                        bindCommandToController(controller, view, command,
                            renderingCallback);
                    }
                });

            bindPropertiesToController(controller, view, function (binding) {
                // Values has just been written to the view and
                // they still have the same value in the controller,
                // so we don't waste time to rebind them.
                return (binding.type === "object");
            });
            
            return view;
        },
        getTemplate = function (pageId, templateName) {
            var views = $("[" + VIEW_ATTRIBUTE + "*='name: " +
                templateName + "']");

            if (views.length > 1) {
                // If there are many views with the same name, 
                // we take the one that is specific to the given page.
                return views.filter("[" + VIEW_ATTRIBUTE + "*='page: " +
                    pageId + "']").html();
            }

            return views.html();
        },
        compile = function (str) {
            // Generate a reusable function that will serve as
            // a template generator.
            return new Function("data", "var p = [];" +
                // Introduce the data as local variables using 
                // with () {}
                "with (data) { p.push('" +

                // Convert the template into pure JavaScript
                str.replace(/[\r\t\n]/g, " ").split("<%")
                    .join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "', $1,'").split("\t")
                    .join("');").split("%>").join("p.push('")
                    .split("\r").join("\\'") +
                    "'); } return p.join('');");
        },
        // application's methods
        bindEventsToController = function (controller, sharedData,
            renderingCallback) {
            var pageEvents = this.options().pageEvents,
                eventIndex,
                pageEvent,
                getPropertyBinder = function (eventName) {
                    return function (property) {
                        var handler = property
                            .entryPoint[property.name];
                            
                        if (eventName === "pagebeforehide" ||
                            eventName === "pagehide") {
                            return function (event, ui) {
                                // Initialize the shared object so
                                // page*show have a fresh reference to
                                // deals with.
                                sharedData.value = {};
                                handler.call(controller,
                                    getRequestObject(event, ui),
                                    getResponseObject(renderingCallback,
                                        sharedData.value));
                            };
                        }
                        else if (eventName === "pagebeforeshow" ||
                            eventName === "pageshow") {    
                            return function (event, ui) {
                                // Pass the shared objet that has been
                                // initialized by the page*hide event.
                                handler.call(controller,
                                    getRequestObject(event, ui, function () {
                                        return sharedData.value;
                                    }),
                                    getResponseObject(renderingCallback));
                            };
                        }
                        else {  
                            return function (event) {
                                handler.call(controller,
                                    getRequestObject(event),
                                    getResponseObject(renderingCallback));
                            };
                        }
                    };
                };
            
            for (eventIndex = 0; eventIndex < pageEvents.length;
                eventIndex += 1) {
                pageEvent = pageEvents[eventIndex];
                
                bindEvent(controller, {
                        event: pageEvent,
                        method: pageEvent,
                        element: controller.page()
                    }, getPropertyBinder(pageEvent));
            }
        },
        buildGetPage = function (pageSelector) {
            var page = $(pageSelector);
            
            return function () {
                return page;
            };
        },
        buildGetName = function (name) {
            return function () {
                return name;
            };
        },
        buildGetAlias = function (alias) {
            return function () {
                return alias;
            };
        },
        buildGetComponent = function (components) {
            return function (alias) {
                return components[alias];
            };
        },
        application =  function (options) {
            var opts = $.extend(options, defaultOptions),
                controllers = {},
                startCallbacks = [],
                stopCallbacks = [],
                templateCache = {},
                sharedData = {
                    value: null
                },
                buildRender = function (controller) {
                    var pageId = controller.page().attr("id"),
                        render = function (source, data) {
                            var viewName,
                                anchor,
                                cacheId,
                                template;
    
                            if (typeof(source) === "object") {
                                viewName = source.name();
                                anchor = source.name() + ":" + source.alias();
                            } else {
                                viewName = source;
                                anchor = source;
                            }
    
                            cacheId = pageId + viewName;
                            template = templateCache[cacheId] =
                                templateCache[cacheId] ||
                                compile(getTemplate(pageId, viewName));
    
                            return renderTemplate(controller, {
                                name: anchor,
                                html: template(data)
                            }, render);
                        };
                    
                    return render;
                },
                app = {
                    options: function () {
                        return opts;
                    },
                    controller: function (pageSelector, ctrl) {
                        if (ctrl) {
                            controllers[pageSelector] = ctrl;
                        }
                        
                        return controllers[pageSelector];
                    },
                    start: function (callback) {
                        var pageSelector,
                            controller,
                            components,
                            component,
                            componentProperties;
                        
                        if (callback && typeof(callback) === "function") {
                            startCallbacks.push(callback);
                            return;
                        }
    
                        for (pageSelector in controllers) {
                            if (!controllers.hasOwnProperty(pageSelector)) {
                                continue;
                            }
                            
                            components = {};
                            controller = controllers[pageSelector];
                            controller.page = buildGetPage(pageSelector);
                            
                            bindEventsToController.call(this, controller,
                                sharedData, buildRender(controller));
                                
                            if (controller.components) {
                                for (var i = 0;
                                    i < controller.components.length;
                                    i += 1) {
                                    componentProperties = 
                                        controller.components[i];
                                    
                                    component = window.jqmMvc.components[
                                        componentProperties.name]();
                                    component.page = controller.page;
                                    component.name = buildGetName(
                                        componentProperties.name);
                                    component.alias = buildGetAlias(
                                        componentProperties.alias);
                                        
                                    bindEventsToController.call(this, component,
                                        sharedData, buildRender(component));
                                        
                                    components[componentProperties.alias] =
                                        component;    
                                }
                            }
                            
                            controller.component =
                                buildGetComponent(components);
                        }
                        
                        for (var i = 0; i < startCallbacks.length;
                            i += 1) {
                            startCallbacks[i].call(this);
                        }
                    },
                    stop: function (callback) {
                        if (callback && typeof(callback) === "function") {
                            stopCallbacks.push(callback);
                            return;
                        }
                        
                        for (var i = 0; i < stopCallbacks.length;
                            i += 1) {
                            stopCallbacks[i].call(this);
                        }
                    }
                };
            
            $(window).unload(function () {
                app.stop();
            });
            
            $(function () {
                app.start();
            });
                
            return app;
        };

    if (typeof (window.jqmMvc) !== "object") {
        window.jqmMvc = {
            application: application,
            components: {}
        };
    }
}(window.jQuery));
