// test/spec for backend/servers/mcapi/db/model/experiment-datasets.js
'use strict';

let assert = require('chai').assert;

let connection = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

let datasets = require('../experiment-datasets')(connection);

describe('Test in backend/servers/mcapi/db/model/experiment-datasets.js - ', function() {
    describe('find dataset by id - ', function() {
        it.skip('Should fail', function* () {
            return yield new Promise(function() {
                console.log("just before failing assert");
                assert.equal(2, 1);
                console.log("just after failing assert");
            });
        });
    });
    describe.skip('find dataset - ', function() {
        it.skip("Simple Tar file created", function*() {
            var Tar = require('tar-async'),
                tape = new Tar({output: require('fs').createWriteStream('/tmp/out.tar')});

            assert.isNull(tape);

            tape.append('test.txt', 'Woohoo!! Tar me up Scotty!', function() {
                console.log("close called");
                tape.close();
            });
        });
        it("Is bogas", function() {
            assert.equal(1, 2);
        });
    });
});

