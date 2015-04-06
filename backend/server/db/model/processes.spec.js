describe('Processes', function() {
    'use strict';
    let atf = require('../../specs/atf');
    let ropts = {
        db: 'mctest',
        port: 30815
    };

    let r = require('rethinkdbdash')(ropts);
    let p = require('./processes')(r);

    describe('#create', function() {
        it('should do something', function(done) {
            function validate(err) {
                console.log("err", err);
                done(err);
            }
            atf(function *() {
                yield p.create({});
            }, validate);
        });
    });
});
