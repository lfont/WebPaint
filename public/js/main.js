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
        'underscore': 'lib/underscore-1.4.4',
        'backbone': 'lib/backbone-1.0.0',
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


require([
    'app'
], function (App) {
    'use strict';
    
    var $   = require('jquery'),
        app = new App();

    if (!window.WebPaint) {
        return;
    }
    
    if (navigator.mozApps) {
        app.isInstalled().done(function (isInstalled) {
            if (isInstalled) {
                app.canBeUpdated().done(function (canBeUpdated) {
                    if (canBeUpdated) {
                        var updatePromise = app.checkForUpdate();
                        updatePromise.fail(function (error) {
                            if (error.name !== 'NETWORK_ERROR') {
                                alert('Update failed, error: ' + error.name);
                            }
                        });
                    }
                });
            } else {
                var installPromise = app.install();
                installPromise.fail(function (error) {
                    if (error.name !== 'REINSTALL_FORBIDDEN') {
                        alert('Install failed, error: ' + error.name);
                    }
                });
            }
        });
    }
            
    $(document).on('mobileinit', function () {
        var screenSize = app.environment.get('screenSize');

        $.mobile.defaultPageTransition =
            $.mobile.defaultDialogTransition =
                screenSize === 'small' ? 'fade': 'slide';
    });
    
    $(window).unload(function () {
        app.environment.set({
            background: app.drawerManager.snapshot()
        });

        app.environment.save();
    });

    WebPaint.app = app;
    
    $(function () {
        app.start();
    });
});
