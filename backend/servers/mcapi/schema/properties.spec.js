/* jshint expr: true */

var model = require('../mocks/model');
var schema = require('./index')(model);
var should = require('should');
var atf = require('../specs/atf');
var util = require('util');

describe('Properties Schema', function() {
    'use strict';

    it('should require a name', function() {
        let p = {
            value: 4,
            units: 'mm',
            _type: 'number',
            measurement_id: 'id'
        };

        let errors = schema.properties.validateSync(p);
        should.exist(errors);
        errors.should.have.ownProperty('name');
    });

    it('should validate the type', function() {
        let p = {
            name: 'name',
            value: 4,
            units: 'mm',
            measurement_id: 'id',
            _type: 'does-not-exist'
        };
        let errors = schema.properties.validateSync(p);
        should.exist(errors);
        errors.should.have.key('_type');
    });

    it('should pass for a valid object', function() {
        let p = {
            name: 'name',
            value: 4,
            units: 'mm',
            measurement_id: 'id',
            _type: 'number'
        };

        let errors = schema.properties.validateSync(p);
        should.not.exist(errors);
    });

    it('should only validate name and ignore other fields', function() {
        let p = {
            name: 'name'
        };

        let errors = schema.properties.validateSync(p, true);
        should.not.exist(errors);
    })
});
