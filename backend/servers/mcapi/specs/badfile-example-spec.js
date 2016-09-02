'use strict';

require('mocha-co');
let chai = require('chai');
let assert = require('chai').assert;
let fs = require('fs')
let filename = 'junk';

describe('Testing-testing sync of acynchronous function:',function () {
    it('generator does not work!', function* () {
        console.log(start);
        let res = "no data";
        try {
            res = yield fs.readFile(filename, 'utf8');
            console.log(res);
            assert.is.not.null(res.value);
        }
        catch(err) {
            console.log(err);
            let message = err.message;
            assert.include(message,"no such file or directory");
            assert.fail();
        }
        console.log(res);
    });
});
