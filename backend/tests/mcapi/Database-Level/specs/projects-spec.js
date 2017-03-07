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

const base_user_id = 'thisIsAUserForTestingONLY!';
const fullname = "Test User";
const base_project_name = "Test project - test 1: ";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let random_user = function(){
    let number = Math.floor(Math.random()*10000);
    return base_user_id + number + "@mc.org";
};

let user1Id = random_user();

before(function*() {
    let user = yield dbModelUsers.getUser(user1Id);
    if (!user) {
        let results = yield r.db('materialscommons').table('users').insert({
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
        assert.equal(user.id,user1Id, "Wrong test user, id = " + user.id);
    }
});

describe('Feature - projects: ', function() {
    describe('Create project', function() {
        it('create project and get project back', function*(){
            let user = yield dbModelUsers.getUser(user1Id);
            let project_name = random_name();
            assert.isNotNull(user,"test user exists");
            let attrs = {
                name: project_name,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user,attrs);
            let project = ret.val;
            assert.equal(project.otype, "project");
            assert.equal(project.name, project_name);
            assert.equal(project.owner, user.id);
            assert.equal(project.owner, user1Id);
            assert.equal(project.users.length,1);
            assert.equal(project.users[0].user_id, user1Id);
        });
        it ('create project and find project in all projects', function*(){
            let user = yield dbModelUsers.getUser(user1Id);
            let project_name = random_name();
            assert.isNotNull(user,"test user exists");
            let attrs = {
                name: project_name,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user,attrs);
            let project = ret.val;
            assert.equal(project.name, project_name);
            assert.equal(project.users[0].user_id, user1Id);
            let project_list = yield projects.all();
            let found_project = null;
            project_list.forEach(function(p){
                if (p.name == project_name) {
                    found_project = p;
                }
            });
            assert.isNotNull(found_project);
            assert.equal(found_project.otype, "project");
            assert.equal(found_project.owner, user.id);
            assert.equal(found_project.owner, user1Id);
        });
        it ('create project and find project by user', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            let project_name = random_name();
            assert.isNotNull(user, "test user exists");
            let attrs = {
                name: project_name,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user, attrs);
            let project = ret.val;
            assert.equal(project.name, project_name);
            assert.equal(project.users[0].user_id, user1Id);
            let project_list = yield projects.forUser(user);
            let found_project = null;
            project_list.forEach(function (p) {
                if (p.name == project_name) {
                    found_project = p;
                }
            });
            assert.isNotNull(found_project);
            assert.equal(found_project.otype, "project");
            assert.equal(found_project.owner, user.id);
            assert.equal(found_project.owner, user1Id);
            assert.equal(found_project.users.length, 1);
            // NOTE: field is user, here, but user_id in test above!!!
            // is this the correct behaivor???
            assert.equal(found_project.users[0].user, user1Id);
        });
        it ('create project, find by user, has full set of properties', function*(){
            let user = yield dbModelUsers.getUser(user1Id);
            let project_name = random_name();
            assert.isNotNull(user,"test user exists");
            let attrs = {
                name: project_name,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user,attrs);
            let project = ret.val;
            let project_list = yield projects.forUser(user);
            let found_project = null;
            project_list.forEach(function(p){
                if (p.name == project_name) {
                    found_project = p;
                }
            });
            assert.isNotNull(found_project);
            assert.equal(found_project.otype, "project");
            assert.equal(found_project.owner, user.id);
            assert.equal(found_project.owner, user1Id);
            assert.equal(found_project.users.length,1);
            assert.equal(found_project.users[0].user, user1Id);
            assert.isTrue(found_project.hasOwnProperty('events'));
            assert.equal(found_project.events.length,0);
            assert.isTrue(found_project.hasOwnProperty('processes'));
            assert.isTrue(found_project.hasOwnProperty('samples'));
            assert.isTrue(found_project.hasOwnProperty('files'));
            assert.isTrue(found_project.hasOwnProperty('experiments'));
            assert.equal(found_project.processes,0);
            assert.equal(found_project.samples,0);
            assert.equal(found_project.files,0);
            assert.equal(found_project.experiments,0);
        });
    });
    describe('Update project', function() {
        it('create project, update name and description', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            let project_name = random_name();
            assert.isNotNull(user, "test user exists");
            let attrs = {
                name: project_name,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user, attrs);
            let project = ret.val;
            assert.equal(project.otype, "project");
            assert.equal(project.name, project_name);
            assert.equal(project.owner, user1Id);
            let name = "Another Name";
            let description = "An alternate description";
            let update_attrs = {
                name: name,
                description: description
            };
            let updated_project = yield projects.update(project.id, update_attrs);
            assert.equal(updated_project.otype, "project");
            assert.equal(updated_project.owner, user1Id);
            assert.equal(updated_project.name, name);
            assert.equal(updated_project.description, description);
        });
    });
});

after(function*() {
    let user = yield dbModelUsers.getUser(user1Id);
    if (user) {
        let results = yield r.db('materialscommons').table('users').get(user1Id).delete();
        assert.equal(results.deleted,1, "The User was correctly deleted");
    } else {
        assert.isNull(user,"The user still exists at end");
    }
});
