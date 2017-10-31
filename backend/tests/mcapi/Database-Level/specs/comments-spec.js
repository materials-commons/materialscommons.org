'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const comments = require(backend_base + '/servers/mcapi/db/model/comments');

let userId = "test@test.mc";

before(function*() {
    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user,"No test user available = " + userId);
});

describe('Feature - comments: ', function() {
    describe('Create comment', function() {
    });
    describe('Update comment', function() {
    });
    describe('Delete comment', function() {
    });
});