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
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');

const base_user_id = 'thisIsAUserForTestingONLY!';
const fullname = "Test User";
const base_project_name = "Test project - test 1: ";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let random_user = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_user_id + number + "@mc.org";
};

let user1Id = random_user();

before(function* () {
    console.log('before measurements-spec.js');
    let user = yield dbModelUsers.getUser(user1Id);
    if (!user) {
        let results = yield r.table('users').insert({
            admin: false,
            affiliation: "",
            avatar: "",
            description: "",
            email: user1Id,
            fullname: fullname,
            homepage: "",
            id: user1Id,
            name: fullname,
            preferences: {
                tags: [],
                templates: []
            }
        });
        assert.equal(results.inserted, 1, "The User was correctly inserted");
    } else {
        assert.equal(user.id, user1Id, "Wrong test user, id = " + user.id);
    }
    console.log('done before measurements-spec.js');
});

describe('Feature - Measurments: ', function () {
    describe('Function level', function () {
        it('individual test level');
    });
});

after(function* () {
    let user = yield dbModelUsers.getUser(user1Id);
    if (user) {
        let results = yield r.table('users').get(user1Id).delete();
        assert.equal(results.deleted, 1, "The User was correctly deleted");
    } else {
        assert.isNull(user, "The user still exists at end");
    }
});

