// backend/servers/mcaip/specs/promise-yield-spec.js
// testing promise with yield
'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;
const Promise = require('bluebird');
const fs = require('fs');
const fsp = Promise.promisifyAll(fs);

const filename = '/tmp/textfile.txt';
const testContent = "Hello world.";

before(function() {
    helperMakeFileIfNeeded(filename);
});

describe('Testing-testing sync of acynchronous function:', function() {
    it('general yield test', function* () {
        var content = (yield fsp.readFileAsync(filename)).toString();
        assert.equal(testContent, content);
    });
});

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
};

function helperMakeFileIfNeeded(path) {
    if (!fileExists(path)) {
        fs.writeFileSync(path, testContent);
    }
};