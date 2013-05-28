module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        requirejs: {
            compile: {
                options: {
                    appDir: './public',
                    baseUrl: 'js',
                    dir: './public-build',
                    keepBuildDir: false,
                    mainConfigFile: './public/js/main.js',
                    locale: 'en-us',
                    removeCombined: true,
                    paths: {
                        'socket.io': 'empty:'
                    },
                    modules: [
                        {
                            name: 'main'
                        },
                        {
                            name: 'boot',
                            exclude: [
                                'jquery',
                                'underscore',
                                'backbone',
                                'drawing-client'
                            ]
                        }
                    ],
                    done: function (done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);
                
                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }
                
                        done();
                    }
                }
            }
        },
        
        clean: [
            './public-build/templates'
        ],
        
        manifest: {
            generate: {
                options: {
                    basePath: './public-build/',
                    fallback: ["/js/drawing-client.js /js/drawing-client-offline.js"],
                    exclude: ["js/drawing-client.js"],
                    preferOnline: false,
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
                dest: './public-build/manifest.appcache'
            }
        }
        
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-manifest');

    // Default task(s).
    grunt.registerTask('default', [ 'requirejs', 'clean', 'manifest' ]);

};
