'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const dbModelUsers = require('../../../servers/mcapi/db/model/users');

const user1Id = 'thisIsAUserForTestingONLY!@mc.org';
const fullname = "Test User";

beforeEach(function*() {
    let results = yield r.db('materialscommons').table('users').insert({
        admin: false ,
        affiliation:  "" ,
        avatar:  "" ,
        description:  "" ,
        email: user1Id,
        fullname:  fullname ,
        homepage:  "" ,
        id: user1Id,
        name: fullname,
        preferences: {
            tags: [],
            templates: []
        }
    });
    assert.equal(results.inserted,1, "The User was correctly inserted");
});

describe('Feature - projects: ', function() {
    describe('Verify user for projects tests', function() {
        it('there is a user for testing', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user is not null");
        });
    });
});

afterEach(function*() {
    let results = yield r.db('materialscommons').table('users').get(user1Id).delete();
    assert.equal(results.deleted,1, "The User was correctly deleted");
});
