/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        'templates': '../templates',
        'i18n': 'lib/requirejs/i18n',
        'text': 'lib/requirejs/text',
        'jquery': 'lib/jquery-2.0.0',
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

define(function () {
    var app = {
        start: function () {
            require([
                'jquery',
                'models/environment'
            ], function ($, EnvironmentModel) {
                'use strict';

                var environment = new EnvironmentModel({
                        appName: 'WebPaint',
                        appVersion: '0.6.21',
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
                    'models/user'
                ], function (MainView, ColorCollection, LanguageCollection,
                             UserCollection, UserModel) {
                    $(function () {
                        var mainView;

                        environment.set({
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
                        mainView.render().$el.css('visibility', 'hidden').appendTo('body');

                        require(['jquery.mobile'], function () {
                            mainView.$el.css('visibility', 'visible');
                        });

                        $(window).unload(function () {
                            environment.set({
                                background: mainView.drawer.snapshot()
                            });

                            environment.save();
                        });
                    });
                });
            });
        }
    };

    if (window['WebPaint'] && WebPaint.autoStart) {
        app.start();
    }

    return app;
});
