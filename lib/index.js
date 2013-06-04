/**
 * module depedencies
 *
 */

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
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
    this.claimed = [];
    this.from = this.options.from || 4000;
    this.to = this.options.to || 5000;
    this.count = this.from;
    this.host = this.options.host || getHost();
    this.redis = redis.createClient();
    this.pub = redis.createClient();
    this.sub = redis.createClient();
    this.initEvents();
}

util.inherits(Tower, EventEmitter);

Tower.prototype.initEvents = function() {
    var self = this;

    this.sub.subscribe('update');

    this.sub.on('message', function(channel, message) {
        switch (channel) {
            case 'update':
                self.emit('service:new', message);
        }
    });

    this.on('dropped', function() {
        console.log('delete associated service');
    });
};

Tower.prototype.scan = function(port, cb) {
    var self = this;
    var server = new net.Server();
    this.redis.sismember('__tower__claimed', self.host + ':' + port, function(err, result) {
        if (result === 0) {
            server.listen(port, this.host, function() {

                server.on('close', function(err) {
                    cb(null, port);
                });

                server.close();

            });
        } else {

            self.scan(self.count++, cb);
        }
    })

    server.on('error', function(err) {
        console.log(err);
        if (port <= self.to) {
            self.scan(port, cb);
        } else {
            self.emit('maxed', port);
            cb(new Error('out of bound'), null);
        }

    });

};

Tower.prototype.release = function(port, cb) {
    var self = this;
    var service = port.split('@')[0];
    var p = port.split('@')[1];
    // clean the port from the redis claimed
    this.redis.srem('__tower__' + service, p, function(err, result) {
        self.redis.srem('__tower__claimed', p, function(err, result) {
            cb(null, result);
        });
    });
};

Tower.prototype.query = function(service, cb) {

    // get array of combo host:port
    this.redis.smembers('__tower__' + service, function(err, result) {
        cb(null, result)
    })
};

Tower.prototype.register = function(service, cb) {
    var self = this;

    if (self.count <= self.to) {

        self.scan(self.count, function(err, port) {
            if (err) {
                cb(err, null);
            } else {
                self.redis.sadd('__tower__' + service, self.host + ':' + port, function(err, result) {
                    self.redis.sadd('__tower__claimed', self.host + ':' + port, function(err, result) {
                        self.emit('new', self.host);
                        self.pub.publish('update', JSON.stringify({
                            service: service,
                            port:  port,
                            host : self.host 
                        }));
                        cb(null, service + '@' + self.host + ':' + port);

                    })

                });
            }
        });
    } else {
        cb(new Error('maxed'), null);
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