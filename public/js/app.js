/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        'templates': '../templates',
        'i18n': 'lib/requirejs/i18n',
        'text': 'lib/requirejs/text',
        'jquery': 'lib/jquery-1.9.1',
        'underscore': 'lib/underscore',
        'backbone': 'lib/backbone',
        'socket.io': '/socket.io/socket.io.js',
        'jquery.mobile': 'lib/jquery.mobile/jquery.mobile-1.3.1',
        'jquery.mobile.toast': 'lib/jquery.mobile/jquery.mobile.toast',
        'drawing': 'lib/drawing/drawing-0.8.0',
        'drawing.event': 'lib/drawing/drawing.event.jquery-0.7.0',
        'sprintf': 'lib/sprintf-0.6'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: [ 'underscore', 'jquery' ],
            exports: 'Backbone'
        },
        'socket.io': {
            exports: 'io'
        },
        'sprintf': {
            exports: 'sprintf'
        }
    }
});

define([
   'jquery'
], function ($) {
    'use strict';

    function App () {
        var mozApp = null;

        this.getSelf = function () {
            var deferred = $.Deferred(),
                request;

            if (mozApp) {
                setTimeout(function () {
                    deferred.resolve(mozApp);
                }, 0);
            } else {
                request = navigator.mozApps.getSelf();

                request.onsuccess = function () {
                    mozApp = this.result;
                    deferred.resolve(mozApp);
                };

                request.onerror = function() {
                    alert('Get failed, error: ' + this.error.name);
                    deferred.reject(this.error);
                };
            }

            return deferred.promise();
        };

        this.install = function () {
            var _this = this,
                manifestUrl = this.installOrigin() + '/manifest.webapp',
                deferred = $.Deferred(),
                request = navigator.mozApps.install(manifestUrl);

            request.onsuccess = function () {
                mozApp = this.result;
                deferred.resolve();
            };

            request.onerror = function () {
                alert('Install failed, error: ' + this.error.name);
                deferred.reject(this.error);
            };

            return deferred.promise();
        };
    }

    App.prototype.start = function () {
        require([
            'models/environment'
        ], function (EnvironmentModel) {
            var environment = new EnvironmentModel({
                    appName: 'WebPaint',
                    appVersion: '0.7.0',
                    screenSize: $(window).height() <= 720 ||
                                $(window).width() <= 480 ?
                                'small' :
                                'normal'
                }),
                locale;

            environment.fetch();
            locale = environment.get('locale');

            // Set the UI language if it is defined by the user.
            if (locale) {
                require.config({
                    config: {
                        i18n: {
                            locale: locale
                        }
                    }
                });
            }

            $(document).on('mobileinit', function () {
                var screenSize = environment.get('screenSize');

                $.mobile.defaultPageTransition =
                    $.mobile.defaultDialogTransition =
                        screenSize === 'small' ? 'fade': 'slide';
            });

            require([
                'views/main',
                'collections/colors',
                'collections/languages',
                'collections/users',
                'models/user',
                'models/quick-action',
            ], function (MainView, ColorCollection, LanguageCollection,
                         UserCollection, UserModel, QuickActionModel) {
                $(function () {
                    var mainView;

                    function getQuickActions () {
                        var notDefined,
                            hasActivitySupport = window.MozActivity != notDefined,
                            actions = [
                                [
                                    new QuickActionModel({
                                        id: 'undo',
                                        type: 'drawer'
                                    }),
                                    new QuickActionModel({
                                        id: 'redo',
                                        type: 'drawer'
                                    })
                                ],
                                new QuickActionModel({
                                    id: 'new',
                                    type: 'page'
                                }),
                                new QuickActionModel({
                                    id: 'pick',
                                    type: hasActivitySupport ? 'activity' : 'popup',
                                    data: { type: [ 'image/png', 'image/jpg', 'image/jpeg' ] }
                                }),
                                new QuickActionModel({
                                    id: 'clear',
                                    type: 'drawer'
                                }),
                                new QuickActionModel({
                                    id: 'history',
                                    type: 'page'
                                })
                            ];

                        if (hasActivitySupport) {
                            actions.splice(3, 0, new QuickActionModel({
                                id: 'share',
                                type: 'popup'
                            }));
                        } else {
                            actions.splice(3, 0, new QuickActionModel({
                                id: 'save',
                                type: 'popup'
                            }));
                        }

                        return actions;
                    }

                    environment.set({
                        actions: getQuickActions(),
                        colors: new ColorCollection([
                            { code: 'transparent' },
                            { code: '#000000' },
                            { code: '#d2691e' },
                            { code: '#ffffff' },
                            { code: '#ffc0cb' },
                            { code: '#ff0000' },
                            { code: '#ffa500' },
                            { code: '#ee82ee' },
                            { code: '#0000ff' },
                            { code: '#40e0d0' },
                            { code: '#008000' },
                            { code: '#ffff00' }
                        ]),
                        languages: new LanguageCollection([
                            { code: 'xx-xx' },
                            { code: 'en-us' },
                            { code: 'fr-fr' }
                        ]),
                        guests: new UserCollection(),
                        user: new UserModel()
                    });

                    mainView = new MainView({ environment: environment });
                    mainView.render().$el.css('visibility', 'hidden')
                                         .appendTo('body');

                    require(['jquery.mobile'], function () {
                        mainView.$el.css('visibility', 'visible');
                    });

                    $(window).unload(function () {
                        environment.set({
                            background: mainView.drawerManager.snapshot()
                        });

                        environment.save();
                    });
                });
            });
        });
    };

    App.prototype.installOrigin = function () {
        return 'http://webpaint.lfont.me';
    };

    App.prototype.isInstalled = function () {
        var deferred = $.Deferred(),
            request = navigator.mozApps.getInstalled();

        request.onsuccess = function () {
            var isInstalled = false;
            $.each(this.result, function(index, app) {
                if (app.manifest.name === 'WebPaint') {
                    isInstalled = true;
                    return false;
                }
            });
            deferred.resolve(isInstalled);
        };

        request.onerror = function () {
            alert('Check Install failed, error: ' + this.error.name);
            deferred.reject(this.error);
        };

        return deferred.promise();
    };

    App.prototype.canBeUpdated = function () {
        var _this = this,
            deferred = $.Deferred(),
            promise = this.getSelf();

        promise.done(function (mozApp) {
            deferred.resolve(mozApp &&
                             mozApp.installOrigin === _this.installOrigin());
        });

        promise.fail(function (error) {
            deferred.reject(error);
        });

        return deferred.promise();
    };

    App.prototype.checkForUpdate = function () {
        var deferred = $.Deferred(),
            promise = this.getSelf();

        promise.done(function (mozApp) {
            var request = mozApp.checkForUpdate();

            request.onsuccess = function () {
                deferred.resolve();
            };

            request.onerror = function() {
                alert('Update failed, error: ' + this.error.name);
                deferred.reject(this.error);
            };
        });

        promise.fail(function (error) {
            deferred.reject(error);
        });

        return deferred.promise();
    };

    var app = new App();

    if (window['WebPaint'] && WebPaint.autoStart) {
        if (navigator.mozApps) {
            app.isInstalled().done(function (isInstalled) {
                if (isInstalled) {
                    app.canBeUpdated().done(function (canBeUpdated) {
                        if (canBeUpdated) {
                            app.checkForUpdate();
                        }
                    });
                } else {
                    app.install();
                }
            });
        }

        app.start();
    }

    return app;
});
