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

const base_project_name = "RenameTest-";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId1 = "test@test.mc";
let userId2 = "another@test.mc";

before(function* () {
    console.log('project-rename-multiuser-spec.js');
    let user = yield dbModelUsers.getUser(userId1);
    assert.isOk(user, "No test user available = " + userId1);
    assert.equal(userId1, user.id);
    user = yield dbModelUsers.getUser(userId2);
    assert.isOk(user, "No test user available = " + userId2);
    assert.equal(userId2, user.id);
    console.log('done before project-rename-multiuser-spec.js');
});

describe('Feature - projects: ', function () {
    describe('Create projects - precondition', function () {
        it('can create two projects with two different users', function* () {
            let user1 = yield dbModelUsers.getUser(userId1);
            assert.isNotNull(user1, "test user1 exists");
            let user2 = yield dbModelUsers.getUser(userId2);
            assert.isNotNull(user1, "test user2 exists");

            let project1 = yield create_project(userId1, user1);
            assert.equal(project1.owner, user1.id);
            assert.equal(project1.owner, userId1);
            assert.equal(project1.users.length, 1);
            assert.equal(project1.users[0].user_id, userId1);

            let project2 = yield create_project(userId2, user2);
            assert.equal(project2.owner, user2.id);
            assert.equal(project2.owner, userId2);
            assert.equal(project2.users.length, 1);
            assert.equal(project2.users[0].user_id, userId2);

            assert.notEqual(project1.users[0].user_id, project2.users[0].user_id);
        });
    });
});

let create_project = function* (userId, user) {
    let project_name = random_name();
    let attrs = {
        name: project_name,
        description: "This is a test project for automated testing."
    };
    let ret = yield projects.createProject(user, attrs);
    let project = ret.val;
    assert.equal(project.otype, "project");
    assert.equal(project.name, project_name);
    assert.equal(project.owner, user.id);
    assert.equal(project.owner, userId);
    assert.equal(project.users.length, 1);
    assert.equal(project.users[0].user_id, userId);
};
