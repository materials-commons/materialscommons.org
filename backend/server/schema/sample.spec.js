/* jshint expr: true */

var model = require('../mocks/model');
var schema = require('./index')(model);
var should = require('should');

describe('Sample Schema', function() {
    'use strict';

    it('should require a name', function() {
        let sample = {
            project_id: "abc123",
            owner: 'owner1'
        };
        let errors = schema.samples.validateSync(sample);
        errors.should.not.be.null;
    });

    it('should make sure name exists', function(done) {
        let sample = {
            name: 'does-not-exist',
            project_id: 'abc123',
            owner: 'owner'
        };
        schema.samples.validate(sample, function(err) {
            err.should.not.be.null;
            done();
        });
    });

    it('should work for an existing name', function(done) {
        let sample = {
            name: 'admin',
            project_id: 'abc123',
            owner: 'owner'
        };
        schema.samples.validate(sample, function(err) {
            should.not.exist(err);
            done();
        });
    });
});
