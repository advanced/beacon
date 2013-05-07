var Tower = require('../'),
    expect = require('chai').expect;

describe('tower', function() {

    describe('events', function() {
        
        it('should fire a new event', function(done) {
            var tower = new Tower();

            tower.on('new', function(port) {
                expect(port).to.be.a('string');
            });
            tower.register('new', done);
        });

        it('should fire a network event', function(done) {
            var tower = new Tower();

            tower.on('service:new', function(port) {
                expect(port).to.be.a('string');
            });
            tower.register('new', done);
        });
        
        it('should fire a maxed event', function(done) {
            var tower = new Tower({
                from: 4000,
                to: 4000
            });
            var fn = function(err, port) {};
            tower.on('maxed', function(port) {
                expect(port).to.be.a('number');
                done();
            });
            tower.register('event', function(err, port) {
                expect(err).to.not.equal('maxed');
                tower.register('event2', function(err, port) {
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