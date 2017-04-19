'use strict';
require('mocha');
import {it} from 'mocha';
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const db_model = backend_base + '/servers/mcapi/db/model/';
const dbModelUsers = require(db_model + 'users');
const projects = require(db_model + 'projects');
const directories = require(db_model + 'directories');
const files = require(db_model + 'files');

const testHelpers = require('./test-helpers');

const base_project_name = "Test file project - ";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";
let user = null;

let project = null;

before(function*() {

    this.timeout(8000); // setup can take up to 8 seconds

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let results = yield testHelpers.createProject(random_name(),user);
    assert.isOk(results);
    assert.isOk(results.val);
    project = results.val;
    assert.equal(project.owner,userId);

    console.log("Project Name: ", project.name);

});

describe('Feature - Files: ', function() {
    describe('Get File Information', function () {
        it('get by id', function* (){
            let file = yield testHelpers.createFileFromDemoFileSet(project,0,user);
            assert.isOk(file);
            assert.equal(file.owner,userId);

            let fileId = file.id;
            let fetchedFile = yield files.get(fileId);
            assert.equal(file.id, fetchedFile.id);
            assert.equal(file.name,fetchedFile.name);
            assert.equal(file.owner,fetchedFile.owner);
        });
        it('get by checksum', function* () {
            let file = yield testHelpers.createFileFromDemoFileSet(project,1,user);
            assert.isOk(file);
            assert.equal(file.owner,userId);

            let checksum = file.checksum;
            let results = yield files.getAllByChecksum(checksum);
            assert.isOk(results);
            let fetchedFileList = [...results];
            assert.isOk(fetchedFileList);
            console.log(fetchedFileList.length);

            let target = null;
            fetchedFileList.forEach((foundFile) => {
                assert.equal(foundFile.owner,userId);
                if (foundFile.id === file.id) {
                    target = foundFile;
                }
            });
            assert.isOk(target);
            assert.equal(file.id, target.id);
            assert.equal(file.name,target.name);
            assert.equal(file.owner,target.owner);
        });

        it('get by id list')
    });
});


/*
 get,
 getAllByChecksum,
 getList,
 fetchOrCreateFileFromLocalPath,
 create,
 update,
 pushVersion,
 deleteFile,
 byPath,
 getVersions
*/