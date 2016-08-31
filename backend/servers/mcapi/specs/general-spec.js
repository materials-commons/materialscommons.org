// this file contains a few general specs for global testing of testing
'use strict';

require('mocha');
//require('mocha-co');
let chai = require('chai');
let assert = require('chai').assert;

let promiseify = require('promise.ify');

describe('General specs - top level', function () {
    describe('Testing general spec', function () {
        it('should succeed', function () {
            assert.equal(0, 0, "zero is zero");
        });
        it.skip('should fail', function () {
            assert.equal(0, 1, "zero is zero");
        });
    });
    describe('Testing spec of acynchronous function',function(){
        it('should succeed', function* (){

        });
    });
});
