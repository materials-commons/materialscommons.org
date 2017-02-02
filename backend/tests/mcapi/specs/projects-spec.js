'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects')

const user1Id = 'thisIsAUserForTestingONLY!@mc.org';
const fullname = "Test User";
const base_project_name = "Test project - test 1: ";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
}

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
            }
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
            }
            let ret = yield projects.createProject(user,attrs);
            let project = ret.val;
            assert.equal(project.name, project_name);
            assert.equal(project.users[0].user_id, user1Id);
            let project_list = yield projects.all();
            var found_project;
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
        it ('create project and find project by user', function*(){
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
            let project_list = yield projects.forUser(user);
            let found_project;
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
            // NOTE: field is user, here, but user_id in test above!!!
            // is this the correct behaivor???
            assert.equal(found_project.users[0].user, user1Id);
        });
    });
});

after(function*() {
    let results = yield r.db('materialscommons').table('users').get(user1Id).delete();
    assert.equal(results.deleted,1, "The User was correctly deleted");
});
