module.exports = function (grunt) {
    var prodPath = ['Scripts/DGoods/global',
        'Scripts/DGoods/moduler',
        'Scripts/DGoods/utils',
        'Scripts/DGoods/viewmodel',
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Scripts/DGoods/global/*.js',
                'Scripts/DGoods/moduler/*.js',
                'Scripts/DGoods/utils/*.js',
                'Scripts/DGoods/viewmodel/*.js',
            ],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint'],
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - v<%= pkg.description %> -' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */;',
            },
        },
    });

    grunt.registerTask('customUglify', 'prepare all files', function () {
        for (var fdindex = 0; fdindex < prodPath.length; fdindex++) {
            grunt.file.expand(prodPath[fdindex] + '/*').forEach(function (dir) {
                var folderArr = dir.split("/");
                var pkg = grunt.file.readJSON('package.json');
                var fileName = folderArr[folderArr.length - 1];
                if (fileName.indexOf('js') != -1) {
                    // get the current uglify config
                    var ctuglify = grunt.config.get('uglify') || {};
                    ctuglify[dir] = {
                        src: prodPath[fdindex] + "/" + fileName,
                        dest: prodPath[fdindex] + "/" + pkg.version + "/",
                        expand: true,    // allow dynamic building
                        flatten: true,   // remove all unnecessary nesting
                        ext: '.min.js'   // replace .js to .min.js
                    };
                    grunt.log.writeln('---------uglify-----' + fileName + '------------');
                    // save the new concat config
                    grunt.config.set('uglify', ctuglify);
                }
            });
        }
        grunt.task.run('uglify');
        grunt.log.writeln('---------completed ----uglify-----------------');

    });

    grunt.registerTask('customConcat', 'prepare all files', function () {
        for (var fdindex = 0; fdindex < prodPath.length; fdindex++) {
            // get the current concat config
            var pkg = grunt.file.readJSON('package.json');
            grunt.file.expand(prodPath[fdindex] +"/"+ pkg.version + "/*").forEach(function (dir) {
                var folderArr = dir.split("/");
                var fileName = folderArr[folderArr.length - 1];

                if (fileName.indexOf('.min.js') != -1) {
                    // get the current concat config
                    var ctconcat = grunt.config.get('concat') || {};
                    ctconcat[dir] = {
                        src: prodPath[fdindex] +"/"+ pkg.version + "/" + fileName,
                        dest: prodPath[fdindex] +"/"+ pkg.version + "/" + fileName,
                    };
                    grunt.log.writeln('-----------concat--------' + fileName + '-------');
                    // save the new concat config
                    grunt.config.set('concat', ctconcat);
                }
            });
            // finally run the concat file
        }
        grunt.task.run('concat');
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', [ 'customConcat']);
};