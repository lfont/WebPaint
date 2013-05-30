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
                    optimize: 'uglify2',
                    removeCombined: true,
                    inlineJSON: false,
                    preserveLicenseComments: false,
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
                                'text'
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
        
        clean: {
            templates: [ './public-build/templates' ],
            config: [ './public-build/config.json' ]
        },
        
        manifest: {
            generate: {
                options: {
                    basePath: './public-build/',
                    preferOnline: false,
                    verbose: true,
                    timestamp: true
                },
                src: [
                    '**/*.html',
                    '**/*.js',
                    '**/*.json',
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
    grunt.registerTask('default', [ 'requirejs', 'clean:templates', 'manifest', 'clean:config' ]);

};
