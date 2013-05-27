/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    'require',
    'jquery',
    'backbone'
], function (require, $, Backbone) {
    'use strict';

    var notDefined;
    
    function App () {
        var mozApp = null;
        
        $.extend(this, Backbone.Events);
        
        this.environment = null;
        this.drawerManager = null;
        this.drawingClient = null;

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
                console.log('Install failed, error: ' + this.error.name);
                deferred.reject(this.error);
            };

            return deferred.promise();
        };
    }

    App.prototype.start = function () {
        var _this = this;
        
        require([
            'models/environment'
        ], function (EnvironmentModel) {
            var locale;
            
            _this.environment = new EnvironmentModel({
                appName: 'WebPaint',
                appVersion: '0.7.8',
                screenSize: $(window).height() <= 720 ||
                            $(window).width() <= 480 ?
                            'small' :
                            'normal'
            });

            _this.environment.fetch();
            locale = _this.environment.get('locale');

            // Set the UI language if it is defined by the user.
            if (locale) {
                window.require.config({
                    config: {
                        i18n: {
                            locale: locale
                        }
                    }
                });
            }

            $(document).on('mobileinit', function () {
                var screenSize = _this.environment.get('screenSize');

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
                'notification-manager',
                'drawer-manager',
                'drawing-client'
            ], function (MainView, ColorCollection, LanguageCollection,
                         UserCollection, UserModel, QuickActionModel,
                         NotificationManager, DrawerManager, DrawingClient) {
                $(function () {
                    var mainView;

                    function getQuickActions () {
                        var hasActivitySupport = window.MozActivity !== notDefined,
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

                    _this.environment.set({
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
                        ])
                    });
                    
                    _this.guests = new UserCollection();
                    _this.user = new UserModel();
                    _this.notificationManager = new NotificationManager();

                    mainView = new MainView({ app: _this })
                        .on('canvasReady', function ($canvas) {
                            this.drawerManager = new DrawerManager($canvas,
                                                                   this.environment);

                            this.drawingClient = new DrawingClient(this.drawerManager,
                                                                   this.guests,
                                                                   this.user,
                                                                   this.notificationManager);
                            
                            this.trigger('ready');
                        }, _this)
                        .render();
                    mainView.$el.css('visibility', 'hidden').appendTo('body');

                    $(window).unload(function () {
                        _this.environment.set({
                            background: _this.drawerManager.snapshot()
                        });

                        _this.environment.save();
                    });
                    
                    require(['jquery.mobile'], function () {
                        mainView.$el.css('visibility', 'visible');
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
                console.log('Update failed, error: ' + this.error.name);
                deferred.reject(this.error);
            };
        });

        promise.fail(function (error) {
            deferred.reject(error);
        });

        return deferred.promise();
    };
    
    App.prototype.checkForCacheUpdate = function () {
        var _this = this,
            deferred = $.Deferred();
        
        applicationCache.addEventListener('updateready', deferred.resolve.bind(_this));
        
        if (applicationCache.status === applicationCache.UPDATEREADY) {
            setTimeout(function () {
                deferred.resolve.call(_this);
            }, 0);
        }
        
        return deferred.promise();
    };
      
    App.prototype.reload = function () {
        location.href = '/';
    };

    return App;
});
