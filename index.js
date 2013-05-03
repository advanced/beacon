/**
 * module depedencies
 *
 */

var EventEmitter = require('events').EventEmitter,
    inherits = require('inherits'),
    redis = require('redis'),
    net = require('net'),
    os = require('os');


module.exports = Tower;

/**
 * Define Tower Contructor.
 *
 * @param {Object} options
 * @api public
 */

function Tower(options) {

    if (!(this instanceof Tower)) {
        return new Tower();
    }

    this.options = options || {};
    this.claimed = {};
    this.from = this.options.from || 5000;
    this.to = this.options.to || 6000;
    this.count = this.from;
    this.host = this.options.host || '127.0.0.1';
    this.socket = new net.Socket();
    this.socket.setTimeout(1000);
    this.host = getHost();
    this.redis = redis.createClient();

}

inherits(Tower, EventEmitter);



Tower.prototype.scan = function(port, cb) {
    var self = this;

    this.socket.connect(port, this.host, function() {
        self.socket.end();
    });

    this.socket.on('error', function(err) {
        // console.log(err)
        cb(null, self.count);
    });

    this.socket.on('connect', function() {
        self.scan(self.count++, cb);
    });

    this.socket.on('end', function(err) {
        console.log('end');
    });
};

Tower.prototype.register = function(service, cb) {
    var self = this;

    this.scan(this.count, function(err, port) {
        self.redis.sadd('__tower__' + service, self.host + ':' + port, function(err, result) {
            self.emit('new',self.host);
            cb(null, service + '@' + self.host + ':' + port);
            self.count++;
        });
    });
};

Tower.prototype.registred = function(service, cb) {
    var self = this;
    self.redis.smembers('__tower__' + service, function(err, services) {
        cb(err, services);
    });
};



var getHost = function getHost(cb) {
    var interfaces = os.networkInterfaces();
    var host;

    Object.keys(interfaces).forEach(function(dev) {

        interfaces[dev].forEach(function(details) {
            if (details.family === 'IPv4' && details.internal === false) {
                host = details.address;
            }
        });

    });
    return host;
};