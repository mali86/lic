/// <binding ProjectOpened='watch' />
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        watch: {
            scripts: {
                files: ['app/**/*.js', 'app/**/*.html'],
                tasks: ['html2js', 'concat', 'ngAnnotate', 'uglify', 'clean'],
                options: {
                    spawn: false
                }
            }
        },

        html2js: {
            options: {
                module: 'lic.templates',
                singleModule: true,
                useStrict: true,
                rename: function (moduleName) {
                    return moduleName.replace('..', '');
                }
            },
            dist: {
                src: ['app/sections/**/*.html', 'app/directives/**/*.html'],
                dest: 'tmp/templates.js'
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/**/*.js', 'tmp/*.js', '!app/config.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            app: {
                files: [
                    {
                        'dist/<%= pkg.name %>.js': ['dist/<%= pkg.name %>.js']
                    },
                ],
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        clean: {
            temp: {
                src: ['tmp']
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['html2js', 'concat', 'ngAnnotate', 'uglify', 'clean']);
};