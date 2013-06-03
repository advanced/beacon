var express = require('express')
var Tower = require(__dirname + '/../../../../node-beacon');

var crypto = require('crypto');
var md5sum = crypto.createHash('md5');


var app = module.exports = express();

var axon = require('axon'),
	push = axon.socket('push'),
	xsub = axon.socket('sub-emitter');

push.format('json');

var tower = new Tower({});

tower.query('pull', function(err, ports) {
console.log(ports);
	ports.forEach(function(ip) {
		console.log(ip);
		push.connect('tcp://'+ip);
	});

});
tower.query('xpub', function(err, ports) {

	ports.forEach(function(ip) {
		console.log(ip);
		xsub.connect('tcp://'+ip);
	});

});


var lres = {};

function saveRes(key, res) {
	lres[key] = res;
}

xsub.on('user:*:' + process.pid, function(m, msg) {
	console.log(m, msg);
	if (lres[msg.qk]) {
		lres[msg.qk].send(msg);
		delete lres[msg.qk];
	}

})


app.get('/user', function(req, res) {
	var str = +new Date() + Math.random() * 11;
	var key = crypto.createHash('md5').update(str.toString()).digest("hex");
	console.log(key)
	var obj = {
		key: req.query.id,
		qk: key,
		method: 'user:*:' + process.pid
	};
	console.log(obj)

	saveRes(key, res);
	push.send(obj)

})