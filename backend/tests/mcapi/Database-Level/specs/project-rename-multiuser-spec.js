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
        it('can create two projects - different users - same name', function* () {
            let user1 = yield dbModelUsers.getUser(userId1);
            assert.isNotNull(user1, "test user1 exists");
            let user2 = yield dbModelUsers.getUser(userId2);
            assert.isNotNull(user1, "test user2 exists");

            let project_name = random_name();
            let project1 = yield create_project(project_name, userId1, user1);
            assert.equal(project1.owner, user1.id);
            assert.equal(project1.owner, userId1);
            assert.equal(project1.users.length, 1);
            assert.equal(project1.users[0].user_id, userId1);

            let project2 = yield create_project(project_name, userId2, user2);
            assert.equal(project2.owner, user2.id);
            assert.equal(project2.owner, userId2);
            assert.equal(project2.users.length, 1);
            assert.equal(project2.users[0].user_id, userId2);

            assert.notEqual(project1.users[0].user_id, project2.users[0].user_id);
        });
        it('can rename a project and the top-level-directory of the project', function* () {
            let user1 = yield dbModelUsers.getUser(userId1);
            assert.isNotNull(user1, "test user1 exists");
            let user2 = yield dbModelUsers.getUser(userId2);
            assert.isNotNull(user1, "test user2 exists");

            let project_name = random_name();
            let project1 = yield create_project(project_name, userId1, user1);
            let project2 = yield create_project(project_name, userId2, user2);

            // Note: the rename must pick up the correct top level directory
            //   but this is dependent on the order of returns from this query
            let dirsList = yield r.table('datadirs').getAll(project_name, {index: 'name'});
            assert.equal(2, dirsList.length);
            let probe_dir = dirsList[0];
            // pick the project who's dir is NOT the probe_dir in the list
            let selected_project = project1;
            if (selected_project.id == probe_dir.project) {
                selected_project = project2;
            }
            assert.notEqual(probe_dir.id, selected_project.id);
            let new_project_name = "newly-named-" + selected_project.name;
            let attrs = {
                name: new_project_name,
                description: "This is a renamed test project."
            };
            yield projects.update(selected_project.id,attrs);
            let project_probe = yield projects.get(selected_project.id);
            assert.equal(project_probe.name, new_project_name);
            // at one point in time, the below statement was failing with a TypeError
            try {
                let top_dir = yield directories.topLevelDir(selected_project.id);
            } catch (e){
                assert.equal(e.name,"TypeError");
                assert.fail(e.message);
            }
        });
    });
});

let create_project = function* (project_name, userId, user) {
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
    return project;
};
