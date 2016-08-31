// this file contains a few general specs for global testing of testing
'use strict';

require('mocha');
//require('mocha-co');
let chai = require('chai');
let assert = require('chai').assert;

describe('Place holder for testing of testing - top level', function () {
    describe('Testing spec of acynchronous function: ', function () {
        it('should fail', function() {
            let worker = function () {
                //return Math.floor(Math.random() * 2) + 1;
                return 2;
            };

            console.log('1');
            var promise = new Promise(function (fulfill, reject) {
                var n = worker();
                if (n === 1) {
                    fulfill(n);
                } else {
                    reject(n);
                }
                console.log('2');
            });

            assert.equal(1,1);

            promise.then(function (x) {
                console.log('one');
                assert.equal(x,1);
                console.log('after assert one');
            }, function (x) {
                assert.equal(2,2);
                console.log('two');
                assert.equal(x,2);
                console.log('after assert two');
                assert.fail('this failed');
                console.log('after assert fail');
            });

            assert.equal(3,3);
            console.log('3');
            assert.fail("fail at end");

        });
    });
});
