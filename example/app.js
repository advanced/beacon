var express = require('express')
var port = process.argv[2] || 8001;
var app = express();

var user = require(__dirname + '/plugins/user')

app.configure(function() {
	app.use(user)
})

app.listen(port)