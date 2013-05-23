require.config({
    baseUrl: '/public/js'
});

require([
    'app'
], function (app) {
    require([
        '/test/client/views/main_test.js',
        '/test/client/views/about_test.js'
    ], function () {
        mocha.reporter('html')
             .ignoreLeaks()
             .run();
    });
});
