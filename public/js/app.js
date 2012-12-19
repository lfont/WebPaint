/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

require.config({
    paths: {
        'i18n': 'lib/requirejs/i18n',
        'text': 'lib/requirejs/text',
        'jquery': 'http://code.jquery.com/jquery-1.8.2.min',
        'underscore': 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min',
        'backbone': 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min',
        'socket.io': 'lib/socket.io/socket.io.min',
        'lib/jquery.mobile': 'http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min',
        'lib/jquery.mobile.toast': 'lib/jquery.mobile/jquery.mobile.toast',
        'drawing': 'lib/drawing/drawing-0.8.0',
        'lib/drawing.event': 'lib/drawing/drawing.event.jquery-0.7.0',
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
    'jquery',
    'models/environment'
], function ($, EnvironmentModel) {
    'use strict';

    var environment = new EnvironmentModel({
            appName: 'WebPaint',
            appVersion: '0.6.15',
            screenSize: $(window).height() <= 720 ? 'small' : 'normal'
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
                screenSize === 'small' ? 'none': 'fade';
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

            mainView = new MainView({
                el: $('<div></div>').appendTo('body'),
                environment: environment
            });

            mainView.render()
                    .show();

            $(window).unload(function () {
                environment.set({
                    background: mainView.drawer.snapshot()
                });

                environment.save();
            });
        });
    });
});
