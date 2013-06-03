var Tower = require(__dirname + '/../../../node-beacon');
var claimed = [];
var axon = require('axon'),
	xpub = axon.socket('pub-emitter'),
	pull = axon.socket('pull');


pull.format('json');

var tower = new Tower({});

tower.register('xpub', function(err, port) {
	claimed.push(port);
	port = 'tcp://' + port.split('@')[1];
	xpub.bind(port);
		console.log(port);


})

tower.register('pull', function(err, port) {
	claimed.push(port);
	port = 'tcp://' + port.split('@')[1];
	pull.bind(port);
	console.log(port);
})

pull.on('message', function(msg) {
	msg.sinkv = 2;
	xpub.emit(msg.method, msg);
});


process.on('SIGQUIT', function() {
	console.log('test term');
	var l = 0;
	claimed.forEach(function(p) {
		tower.release(p, function(err, response) {
			console.log(response);
			if (claimed.length === ++l) {
				process.exit();
			}
		});

	});
});
