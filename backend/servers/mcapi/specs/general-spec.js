// this file contains a few general specs for global testing of testing
'use strict';

require('mocha');
let chai = require('chai');
let assert = require('chai').assert;

describe('General specs - top level', function() {
    describe('Testing general spec', function() {
        it('should succeed', function() {
            assert.equal(0, 0, "zero is zero");
        });
    });
});
