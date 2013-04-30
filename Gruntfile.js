module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        manifest: {
            generate: {
                options: {
                    basePath: './public/',
                    fallback: ["/js/drawing-client.js /js/drawing-client-offline.js"],
                    exclude: ["js/drawing-client.js"],
                    preferOnline: true,
                    verbose: true,
                    timestamp: true
                },
                src: [
                    '**/*.html',
                    '**/*.js',
                    '**/*.css',
                    '**/*.png',
                    '**/*.gif'
                ],
                dest: './public/manifest.appcache'
            }
        }
    });

    // Load the plugin that provides the "manifest" task.
    grunt.loadNpmTasks('grunt-manifest');

    // Default task(s).
    grunt.registerTask('default', ['manifest']);

};
