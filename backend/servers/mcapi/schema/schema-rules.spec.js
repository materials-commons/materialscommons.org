/* jshint expr: true */

var model = require('../mocks/model');
var rules = require('./schema-rules')(model);
var atf = require('../specs/atf');
var should = require('should');
var promise = require('bluebird');

promise.promisifyAll(rules);

describe('Schema Rules', function() {
    'use strict';

    describe('#mustExist', function() {
        it('should not error if item exists', function(done) {
            function validate(err) {
                let rv = null;
                try {
                    should.not.exist(err);
                } catch (error) {
                    rv = error;
                }
                done(rv);
            }

            atf(function *testDoesExist() {
                yield rules.mustExistAsync('admin', 'users');
            }, validate);
        });

        it('should error if item does not exist', function(done) {
            function validate(err) {
                let rv = null;
                try {
                    err.should.exist;
                    err.should.be.an.instanceOf(Object).and.have.property('rule');
                    err.rule.should.be.eql('mustExist');
                    err.actual.should.be.eql('not-exist');
                } catch (error) {
                    rv = error;
                }
                done(rv);
            }
            atf(function *() {
                yield rules.mustExistAsync('not-exist', 'users');
            }, validate);
        });
    });

    describe('#mustNotExist', function() {
        it('should be successful when item does not exist', function(done) {
            function validate(err) {
                let rv = null;
                try {
                    should.not.exist(err);
                } catch (error) {
                    rv = error;
                }
                done(rv);
            }
            atf(function *() {
                yield rules.mustNotExistAsync('not-exist', 'users');
            }, validate);
        });

        it('should fail if name exists', function(done) {
            function validate(err) {
                let rv = null;
                try {
                    err.should.exist;
                    err.rule.should.be.eql('mustNotExist');
                    err.actual.should.be.eql('admin');
                } catch (error) {
                    rv = error;
                }
                done(rv);
            }
            atf(function *() {
                yield rules.mustNotExistAsync('admin', 'users');
            }, validate);
        });
    });
});
