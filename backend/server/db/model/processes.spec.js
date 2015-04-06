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
        it('should create a process', function(done) {
            function validate(err) {
                console.log("err", err);
                done(err);
            }
            atf(function *() {
                let process = {
                    name: 'as_received',
                    owner: 'test@mc.org',
                    template_id: 'as_received',
                    description : '',
                    project_id: 'abc123',
                    settings: [],
                    measurements: []
                };
                yield p.create(process);
            }, validate);
        });
    });
});
