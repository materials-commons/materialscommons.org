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

    project = yield testHelpers.createProject(random_name(),"Project for testing files");

    let file1 = yield testHelpers.createFileFromDemoProjectFileSet(0);
    let file2 = yield testHelpers.createFileFromDemoProjectFileSet(0);
    let file3 = yield testHelpers.createFileFromDemoProjectFileSet(1);

});

describe('Feature - Files: ', function() {
    describe('Get File Information', function () {
        it('get by id');
        it('get by checksum');
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