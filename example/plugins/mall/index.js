var express = require('express')
var app = module.exports = express();


app.configure(function() {
	app.set('views', __dirname+'/views');
	app.set('view engine', 'jade');
	app.set('view options', {layout: true});

})
app.get('/mall', function(req, res) {
	res.render('index')
})


