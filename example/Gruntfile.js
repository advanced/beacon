var fs = require('fs'),
	_ = require('lodash');

var dir = fs.readdirSync(__dirname + '/plugins')
var dd = []

dir.forEach(function(d) {
	var f = {
		src: [__dirname + '/plugins/' + d + '/assets/**/*.js'],
		dest: __dirname + '/public/' + d + '.min.js'
	}
	dd.push(f)
})


var concatJS = function(){
	var ob = {}
	var f = {}
	dir.forEach(function(d) {
		 f[d] = {
			src: [__dirname + '/plugins/' + d + '/assets/**/*.js'],
			dest: __dirname + '/public/' + d + '.js'
		}
		_.extend(ob,f)
	})
	return (ob)
}

/*
template=>
 plugin_name :{
	src:[list of files]
	dest:[plugin_name.js]
}
*/

// basic: {
//   src: ['<%= dirs.src %>/main.js'],
//   dest: '<%= dirs.dest %>/basic.js'
// },
// extras: {
//   src: ['<%= dirs.src %>/main.js', '<%= dirs.src %>/extras.js'],
//   dest: '<%= dirs.dest %>/with_extras.js'
// }
module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		concat: test(),			
		uglify: {
			my_target: {
				files: dd
			}
		},
		jade: {
			no_options: {
				files: {
					'./public/': [__dirname + '/plugins/**/assets/template/*.jade']
				}
			}
		}

	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jade');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask('default', ['concat']);


}