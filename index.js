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
        return new Tower(options);
    }

    this.options = options || {};
    this.claimed = {};
    this.from = this.options.from || 4000;
    this.to = this.options.to || 5000;
    this.count = this.from;
    this.host = this.options.host || getHost();
    this.redis = redis.createClient();
    this.pub = redis.createClient();
    this.sub = redis.createClient();
    this.initEvents();
}

inherits(Tower, EventEmitter);

Tower.prototype.initEvents = function() {
    var self = this;

    this.sub.subscribe('update');
    
    this.sub.on('message', function(channel, message) {
        self.emit('network update', message);
    });
};

Tower.prototype.scan = function(port, cb) {
    var self = this;
    var server = new net.Server();

    server.listen(port, this.host, function() {

        server.on('close', function(err) {
            cb(null, port);
        });

        server.close();

    });

    server.on('error', function(err) {
        console.log(err);
        if (port <= self.to) {
            self.scan(port, cb);
        } else {
            self.emit('maxed', port);
            cb('out of bound', null);
        }

    });

};

Tower.prototype.register = function(service, cb) {
    var self = this;

    if (self.count <= self.to) {
        self.scan(self.count, function(err, port) {
            if (err) {
                cb(err, null);
            } else {
                self.redis.sadd('__tower__' + service, self.host + ':' + port, function(err, result) {
                    self.emit('new', self.host);
                    self.pub.publish('update', JSON.stringify({
                        a: service
                    }));
                    cb(null, service + '@' + self.host + ':' + port);
                });
            }
        });
    } else {
        cb('maxed', null);
    }
    self.count++;

};

Tower.prototype.registred = function(service, cb) {
    var self = this;
    this.redis.smembers('__tower__' + service, function(err, services) {
        cb(err, services);
    });
};


var getHost = function getHost(cb) {
    var interfaces = os.networkInterfaces();
    var host;

    Object.keys(interfaces).forEach(function(dev) {

        interfaces[dev].forEach(function(details) {
            if (details.family === 'IPv4' && !details.internal) {
                host = details.address;
            }
        });

    });
    return host;
};