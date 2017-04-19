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
        it('get by id', function*() {
            let file = yield testHelpers.createFileFromDemoFileSet(project, 0, user);
            assert.isOk(file);
            assert.equal(file.owner, userId);

            let fileId = file.id;
            let fetchedFile = yield files.get(fileId);
            assert.equal(file.id, fetchedFile.id);
            assert.equal(file.name, fetchedFile.name);
            assert.equal(file.owner, fetchedFile.owner);
        });
        it('get by checksum', function*() {
            let file = yield testHelpers.createFileFromDemoFileSet(project, 1, user);
            assert.isOk(file);
            assert.equal(file.owner, userId);

            let checksum = file.checksum;
            let results = yield files.getAllByChecksum(checksum);
            assert.isOk(results);
            let fetchedFileList = [...results];
            assert.isOk(fetchedFileList);

            let target = null;
            fetchedFileList.forEach((foundFile) => {
                assert.equal(foundFile.owner, userId);
                if (foundFile.id === file.id) {
                    target = foundFile;
                }
            });
            assert.isOk(target);
            assert.equal(file.id, target.id);
            assert.equal(file.name, target.name);
            assert.equal(file.owner, target.owner);
        });
        it('get by id list', function*() {
            let file1 = yield testHelpers.createFileFromDemoFileSet(project, 1, user);
            assert.isOk(file1);
            assert.equal(file1.owner, userId);
            let file2 = yield testHelpers.createFileFromDemoFileSet(project, 2, user);
            assert.isOk(file2);
            assert.equal(file2.owner, userId);

            let idList = [file1.id, file2.id];
            let fileList = yield files.getList(project.id, idList);
            assert.isOk(fileList);
            assert.equal(fileList.length, 2);
            fileList.forEach(file => {
                let found = (idList.indexOf(file.id) > -1);
                assert(found, `failed to find file ${file.name} in query results`);
            })
        });
    });
    describe('File Update', function () {
        it('will move a file', function* () {
            let file = yield testHelpers.createFileFromDemoFileSet(project,2,user);
            assert.isOk(file);
            assert.equal(file.owner,userId);

            let top_directory = yield directories.get(project.id,'top');
            let from_dir = '/';
            let path = 'SubDir/AnotherDir';
            let dir_args = {
                from_dir: from_dir,
                path: path
            };
            let result = yield directories.create(project.id,project.name,dir_args);
            assert.isTrue(result.hasOwnProperty('val'));
            let dir_list = result.val;
            assert.equal(dir_list.length, 2);
            assert.equal(dir_list[0].name,project.name + '/SubDir');
            assert.equal(dir_list[1].name,project.name + '/SubDir/AnotherDir');

            let targetDir = dir_list[1];

            let updateArgs = {
                move : {
                    new_directory_id: targetDir.id,
                    old_directory_id: top_directory.id
                }
            };

            yield files.update(file.id,project.id,user,updateArgs);

            let probe = yield directories.fileInDirectoryByName(targetDir.id,file.name);
            assert.isOk(probe);
            assert.equal(probe.owner,userId);
            assert.equal(probe.id,file.id);

        });
    });
});


/*
 fetchOrCreateFileFromLocalPath,
 create,
 update,
 deleteFile,
 byPath,
*/

/* updates:
 name
 description
 tags
 notes
 processes
 samples
 move
 */