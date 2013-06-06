var Beacon = require('../'),
    expect = require('chai').expect;
var claimed = [];
describe('beacon', function() {

    describe('#register', function() {
        it('should get a port in the specified range', function(done) {
            var beacon = new Beacon();
            beacon.register('api', function(err, port) {
                if (err) {
                    return done(err);
                }
                expect(port).to.be.a('string');
                claimed.push(port);
                done();
            });
        });

        it('should augment the array for api', function(done) {
            var beacon = new Beacon();
            beacon.register('api', function(err, port) {
                if (err) {
                    return done(err);
                }
                claimed.push(port);
                expect(port).to.be.a('string');
                done();
            });
        });

        it('should get the combosfor api', function(done) {
            var beacon = new Beacon();
            beacon.query('api', function(err, port) {
                if (err) {
                    return done(err);
                }
                expect(port).to.be.an('array');
                done();
            });
        });

        it('should relase the ports', function(done) {
            var beacon = new Beacon();
            var l = 0;
            claimed.forEach(function(p) {
                beacon.release(p, function(err, response) {
                    console.log(response);
                    console.log(claimed.length, l);
                    if (claimed.length === ++l) {
                        done();
                    }
                });

            });
        });

    });

});