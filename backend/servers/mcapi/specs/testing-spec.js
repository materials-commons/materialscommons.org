// this file contains a few general specs for global testing of testing
'use strict';

require('mocha');
//require('mocha-co');
let chai = require('chai');
let assert = require('chai').assert;

describe('Place holder for testing of testing - top level', function () {
    describe('Testing spec of acynchronous function (using promise): ', function () {
        it('random test of sucess/fail on promise', function() {
            let worker = function () {
                return Math.floor(Math.random() * 2) + 1;
            };

            console.log('start');
            var promise = new Promise(function (fulfill, reject) {
                
                var n = worker();
                if (n === 1) {
                    fulfill(n);
                } else {
                    reject(n);
                }
                console.log('run promise');
            });

            console.log('promise set');

            return promise.then(function (x) {
                console.log('success branch');
                assert.equal(x,1);
                console.log('after assert one');
            }, function (x) {
                console.log('fail branch');
                assert.equal(x,2);
                console.log('after assert two');
            });
        });
    });
});
