/* jshint expr: true */

var model = require('../mocks/model');
var schema = require('./index')(model);
var should = require('should');
var atf = require('../specs/atf');
var util = require('util');

describe('CreateDirectory Schema', function() {
    'use strict';

    it('should fail when directory does not exist', function(done) {
        function validateError(err) {
            let rv = null;
            try {
                should.exist(err);
            } catch (error) {
                rv = error;
            }
            done(rv);
        }
        atf(function* testDirectoryDoesNotExist() {
            let args = {
                project_id: 'abc123',
                from_dir: 'does-not-exist',
                path: '/def456'
            };
            yield schema.createDirectory.validateAsync(args);
        }, validateError);
    })
});

//describe('Sample Schema', function() {
//    'use strict';
//
//    it('should require a name', function() {
//        let sample = {
//            project_id: "abc123",
//            owner: 'owner1'
//        };
//        let errors = schema.samples.validateAsync(sample);
//        errors.should.not.be.null;
//    });
//
//    it('should error when sample exists', function(done) {
//        function validateError(err) {
//            let rv = null;
//            try {
//                err.should.not.be.null;
//                err.should.be.an.instanceOf(Object).and.have.property('name');
//                err.name.errors.should.be.length(1);
//                let error = err.name.errors[0];
//                error.rule.should.eql('mustNotExistInProject');
//            } catch (error) {
//                rv = error;
//            }
//            done(rv);
//        }
//        atf(function *testSampleDoesExist() {
//            let sample = {
//                name: 'sample1',
//                project_id: 'project1',
//                owner: 'admin'
//            };
//            yield schema.samples.validateAsync(sample);
//        }, validateError);
//    });
//
//    it('should succeed with a new sample name, other fields correct', function(done) {
//        function validateNoError(err) {
//            let rv = null;
//            try {
//                should.not.exist(err);
//            } catch (error) {
//                rv = error;
//            }
//            done(rv);
//        }
//        atf(function *testCorrectSample() {
//            let sample = {
//                name: 'sample',
//                project_id: 'project1',
//                owner: 'admin'
//            };
//            yield schema.samples.validateAsync(sample);
//        }, validateNoError);
//    });
//
//    it('should not error for a sample that exists in a different project', function(done) {
//        function validateError(err) {
//            let rv = null;
//            try {
//                should.not.exist(err);
//            } catch (error) {
//                rv = error;
//            }
//            done(rv);
//        }
//
//        atf(function *testSampleInDifferentProject() {
//            let sample = {
//                name: 'sample1',
//                project_id: 'project2',
//                owner: 'admin'
//            };
//            yield schema.samples.validateAsync(sample);
//        }, validateError);
//    });
//
//});
//
//describe('Measurements Schema', function() {
//    'use strict';
//
//    it('should error when no name is given', function(done) {
//        function validateError(err) {
//            let rv = null;
//            should.exist(err);
//            done(rv);
//        }
//        atf(function *() {
//            let m = {
//                attribute: 'area_fraction',
//                _type: 'number',
//                value: 4,
//                units: 'mm',
//                sample_id: 'sample1',
//                project_id: 'project1',
//                attribute_id: 'abc123'
//            };
//            yield schema.measurements.validateAsync(m);
//        }, validateError);
//    });
//
//    it('should error when neither attribute_id or attribute_set_id are given',
//       function(done) {
//           function validateError(err) {
//               let rv = null;
//               try {
//                   should.exist(err);
//               } catch (error) {
//                   rv = error;
//               }
//               done(rv);
//           }
//           atf(function *() {
//               let m = {
//                   name: 'Area Fraction',
//                   attribute: 'area_fraction',
//                   _type: 'number',
//                   value: 4,
//                   units: 'mm',
//                   sample_id: 'sample1',
//                   project_id: 'project1'
//               };
//               yield schema.measurements.validateAsync(m);
//           }, validateError);
//       });
//
//    it('should pass when attribute_id is given, but not attribute_set_id',
//       function(done) {
//           function validateError(err) {
//               let rv = null;
//               try {
//                   should.not.exist(err);
//               } catch (error) {
//                   rv = error;
//               }
//               done(rv);
//           }
//           atf(function *() {
//               let m = {
//                   name: 'Area Fraction',
//                   attribute: 'area_fraction',
//                   _type: 'number',
//                   value: 4,
//                   units: 'mm',
//                   sample_id: 'sample1',
//                   project_id: 'project1',
//                   attribute_id: 'attr_1'
//               };
//               yield schema.measurements.validateAsync(m);
//           }, validateError);
//       });
//});
