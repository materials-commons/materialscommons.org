'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const model = require('../../../servers/mcapi/db/model')(r);
const schema = require('../../../servers/mcapi/schema')(model);
const experiments = require('../../../servers/mcapi/resources/experiments')(model.experiments, model.samples, schema);
const resourcesUsers = require('../../../servers/mcapi/resources/users')(model.users, model.experiments, schema);

const dbModelUsers = require('../../../servers/mcapi/db/model/users')(r);

const user1Id = 'thisIsAUserForTestingONLY!@mc.org';
const fullname = "Test User"

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

describe('Feature - reset lost password: ', function() {
    describe('User with reset_password flag', function() {
        it('there is a user for testing', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user is not null");
        });
        it('User with the reset password flag set', function*() {
            let user =  yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user is not null");
            let result = yield dbModelUsers.setUserPasswordResetFlag(user1Id);
            assert.equal(result.replaced,1, "The flag was correctly added to the user");
            user =  yield dbModelUsers.getUser(user1Id);
            assert.isTrue(user.reset_password,"The flag is set");
        });
        it('User reset password flag set cleared', function*() {
            let user =  yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user is not null");
            let result = yield dbModelUsers.setUserPasswordResetFlag(user1Id);
            assert.equal(result.replaced,1, "The flag was correctly added to the user");
            user =  yield dbModelUsers.getUser(user1Id);
            assert.isTrue(user.reset_password);
            result = yield dbModelUsers.clearUserPasswordResetFlag(user1Id);
            assert.equal(result.replaced,1, "The flag was correctly cleared from the user");
            user =  yield dbModelUsers.getUser(user1Id);
            assert.isUndefined(user.reset_password,"The flag is cleared");
        });
    });
});

afterEach(function*() {
    let results = yield r.db('materialscommons').table('users').get(user1Id).delete();
    assert.equal(results.deleted,1, "The User was correctly deleted");
});

