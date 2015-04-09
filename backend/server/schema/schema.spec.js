/* jshint expr: true */

var model = require('../mocks/model');
var schema = require('./index')(model);
var should = require('should');
var atf = require('../specs/atf');
var util = require('util');

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

    it('should error when sample exists', function(done) {
        function validateError(err) {
            let rv = null;
            try {
                err.should.not.be.null;
                err.should.be.an.instanceOf(Object).and.have.property('name');
                err.name.errors.should.be.length(1);
                let error = err.name.errors[0];
                error.rule.should.eql('mustNotExistInProject');
            } catch (error) {
                rv = error;
            }
            done(rv);
        }
        atf(function *testSampleDoesExist() {
            let sample = {
                name: 'sample1',
                project_id: 'project1',
                owner: 'admin'
            };
            yield schema.samples.validateAsync(sample);
        }, validateError);
    });

    it('should succeed with a new sample name, other fields correct', function(done) {
        function validateNoError(err) {
            let rv = null;
            try {
                should.not.exist(err);
            } catch (error) {
                rv = error;
            }
            done(rv);
        }
        atf(function *testCorrectSample() {
            let sample = {
                name: 'sample',
                project_id: 'project1',
                owner: 'admin'
            };
            yield schema.samples.validateAsync(sample);
        }, validateNoError);
    });

    it('should not error for a sample that exists in a different project', function(done) {
        function validateError(err) {
            let rv = null;
            try {
                should.not.exist(err);
            } catch (error) {
                rv = error;
            }
            done(rv);
        }

        atf(function *testSampleInDifferentProject() {
            let sample = {
                name: 'sample1',
                project_id: 'project2',
                owner: 'admin'
            };
            yield schema.samples.validateAsync(sample);
        }, validateError);
    });

});
