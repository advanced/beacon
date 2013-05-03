var adminPid = '/tmp/pids/admin.pid'
module.exports = function(grunt) {

    grunt.initConfig({
        // 'plugins/**/*.js'
        jshint: {
            files: ['index.js'],
            options: {
                jshintrc: '.jshintrc',
            }
        },

        watch: {
            files: ['index.js'],
            tasks: ['jshint']
        }


    });



    // linting
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // utils 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');

};