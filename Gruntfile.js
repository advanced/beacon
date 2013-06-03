module.exports = function(grunt) {

    grunt.initConfig({
        // 'plugins/**/*.js'
        jshint: {
            files: ['index.js','test/*.js'],
            options: {
                jshintrc: '.jshintrc',
            }
        },

        watch: {
            files: ['index.js', 'test/*.js', 'lib/*.js'],
            tasks: ['jshint', 'exec']
        },
        
        exec: {
            test: {
                command: 'npm test',
                stdout: true,
                stderr: true
            }
        }
    


    });

// linting
grunt.loadNpmTasks('grunt-contrib-jshint');


// utils 
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-notify');

};