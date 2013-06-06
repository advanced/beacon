var Beacon = require('../'),
    expect = require('chai').expect;

describe('beacon', function() {

    describe('events', function() {
        
        it('should fire a new event', function(done) {
            var beacon = new Beacon();

            beacon.on('new', function(port) {
                expect(port).to.be.a('string');
            });
            beacon.register('new', done);
        });

        it('should fire a network event', function(done) {
            var beacon = new Beacon();

            beacon.on('service:new', function(port) {
                expect(port).to.be.a('string');
            });
            beacon.register('new', done);
        });
        
        it('should fire a maxed event', function(done) {
            var beacon = new Beacon({
                from: 4000,
                to: 4000
            });
            var fn = function(err, port) {};
            beacon.on('maxed', function(port) {
                expect(port).to.be.a('number');
                done();
            });
            beacon.register('event', function(err, port) {
                expect(err).to.not.equal('maxed');
                beacon.register('event2', function(err, port) {
                    expect(port).to.be.a('null');
                    expect(err).to.not.be.a('null');
                    expect(err).to.have.ownProperty('message');
                    expect(err.message).to.equal('maxed');
                    done();
                });
            });

        });
    });

});