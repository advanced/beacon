/**
 * module depedencies
 *
 */

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    redis = require('redis'),
    net = require('net'),
    os = require('os');


module.exports = Beacon;

/**
 * Define Beacon Contructor.
 *
 * @param {Object} options
 * @api public
 */

function Beacon(options) {

    if (!(this instanceof Beacon)) {
        return new Beacon(options);
    }


    this.options = options || {};
    this.options.port  = this.options.port || 6379;
    this.options.host = this.options.host || 'localhost' ;
    
    this.claimed = [];
    this.from = this.options.from || 4000;
    this.to = this.options.to || 6000;
    this.count = this.from;
    this.host = this.options.host || getHost();
    this.redis = redis.createClient(this.options.port,this.options.host);
    this.pub = redis.createClient(this.options.port,this.options.host);
    this.sub = redis.createClient(this.options.port,this.options.host);
    this.initEvents();
}

util.inherits(Beacon, EventEmitter);

Beacon.prototype.initEvents = function() {
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

Beacon.prototype.scan = function(port, cb) {
    var self = this;
    var server = new net.Server();
    this.redis.sismember('__beacon__claimed', self.host + ':' + port, function(err, result) {
        if (result === 0) {
            console.log('in claimed');
            server.listen(port, this.host, function() {

                server.on('close', function(err) {
                    console.log(process.pid,port);
                    cb(null, port);
                });

                server.close();

            });
        } else {

            self.getCount(function(err, count) {
                self.scan(count, cb);
            });
        }
    })

    server.on('error', function(err) {
        console.log(err);
        self.getCount(function(err, count) {
            if (count <= self.to) {
                self.scan(count, cb);
        } else {
                console.log('in scan maxed');

            self.redis.set('__beacon__count', self.from, function(err, count) {
                self.emit('maxed', self.host);
                self.scan(self.from, cb);
            });
        }
        });


    });

};

Beacon.prototype.release = function(port, cb) {
    var self = this;
    try{
        var service = port.split('@')[0];
        var p = port.split('@')[1];
    this.redis.srem('__beacon__' + service, p, function(err, result) {
        self.redis.srem('__beacon__claimed', p, function(err, result) {
            cb(null, result);
        });
    });

    }
    catch(e){
        cb('err while releasing',null);
    }
    // clean the port from the redis claimed
};

Beacon.prototype.query = function(service, cb) {

    // get array of combo host:port
    this.redis.smembers('__beacon__' + service, function(err, result) {
        cb(null, result)
    })
};

Beacon.prototype.getCount = function(cb) {
    var self = this;

    this.redis.get('__beacon__count', function(err, count) {

        // first time use, no key is set yet, return left range and incr for next run
        if (!count) {
            self.redis.set('__beacon__count', self.count, function(err, count) {
                if (!err) {
                    self.redis.incr('__beacon__count', function(err, ncount) {
                        cb(null, ncount);
                    });
                }
            });
            // get the key and incr for the next run            
        } else {
            self.redis.incr('__beacon__count', function(err, ncount) {
                cb(null, ncount);
            });
        }
    });

};

Beacon.prototype.register = function(service, cb) {
    var self = this;

    this.getCount(function(err, count) {
        if (count <= self.to) {
            self.scan(count, function(err, port) {
                if (err) {
                    cb(err, null);
                } else {
                    self.redis.sadd('__beacon__' + service, self.host + ':' + port, function(err, result) {
                        self.redis.sadd('__beacon__claimed', self.host + ':' + port, function(err, result) {
                            self.emit('new', self.host);
                            self.pub.publish('update', JSON.stringify({
                                service: service,
                                port: port,
                                host: self.host
                            }));
                            cb(null, service + '@' + self.host + ':' + port);

                        })

                    });
                }
            });
        } else {
            self.redis.set('__beacon__count', self.from, function(err, count) {
                console.log('in register maxed');
                self.emit('maxed', self.host);
                self.register(service, cb);

            });
        }
    });

};

Beacon.prototype.registred = function(service, cb) {
    var self = this;
    this.redis.smembers('__beacon__' + service, function(err, services) {
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