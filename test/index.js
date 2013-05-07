var Tower = require('../'),
    expect = require('chai').expect;

describe('tower', function() {
   
    describe('#register', function() {
        it('should get a port in the specified range', function(done) {
            var tower = new Tower();
            tower.register('service', function(err, port) {
                if (err) {
                    return done(err);
                }
                expect(port).to.be.a('string');
                done();
            });
        });
    });
    
});