'use strict';
require('mocha');
const it = require('mocha').it;
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const lib_base = backend_base + '/servers/lib/'

const db_model = backend_base + '/servers/mcapi/db/model/';
const dbModelUsers = require(db_model + 'users');
const projects = require(db_model + 'projects');
const directories = require(db_model + 'directories');
const files = require(db_model + 'files');

const fileUtils = require(lib_base + 'create-file-utils');

const testHelpers = require('./test-helpers');

const base_project_name = "Test file project - ";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";
let user = null;

before(function*() {

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

});

describe.skip('Feature - Files: ', function () {
    describe('Delete', function () {
        it('Will delete a file that has the uses id set', function*() {

            let project = yield setupProject();

            let file1 = yield testHelpers.createFileFromDemoFileSet(project, 1, user);
            assert.isOk(file1);
            assert.equal(file1.owner, userId);

            let fileWithUsesId = file1;

            console.log("file1: ", file1.id);

            if (file1.usesid == '') {
                let file2 = yield testHelpers.createFileFromDemoFileSet(project, 1, user);
                assert.isOk(file2);
                assert.equal(file2.owner, userId);

                assert.equal(file1.checksum, file2.checksum);
                assert.isOk(file2.usersid);

                console.log("file2: ", file1.id);

                fileWithUsesId = file2;
            }

            console.log("fileWithUsesId: ", fileWithUsesId.id);
            console.log("it's usesid: ", fileWithUsesId.usesid);

            let valOrError = yield files.deleteFile(fileWithUsesId.id);
            assert.isOk(valOrError);
            assert.isOk(valOrError.val);
            let fileDeleted = valOrError.val;

            assert.equal(fileDeleted.id, fileWithUsesId.id);

            let message = `Physical file for id ${fileWithUsesId.id} unexpectedly missing.`;
            assert(fileUtils.datafilePathExists(fileWithUsesId.id), message)
        });
        it('Will delete a file but keep physical file when needed', function*() {

            let project = yield setupProject();

            let file1 = yield testHelpers.createUniqueTestFile(project, user);
            assert.isOk(file1);
            assert.equal(file1.owner, userId);

            let file2 = yield testHelpers.createTestFileFromGivenFile(file1, project, user);
            assert.isOk(file2);
            assert.equal(file2.owner, userId);

            let continueFlag = true;
            let checksum = file1.checksum;

            while (continueFlag) {
                let results = yield files.getAllByChecksum(checksum);
                assert.isOk(results);
                let fetchedFileList = [...results];
                assert.isOk(fetchedFileList);

                assert(fetchedFileList.length > 0);
                let fileNumber1 = fetchedFileList.length;
                let target = fetchedFileList[0];

                let baseFileId = target.id;
                if (target.usesid) {
                    baseFileId = target.usesid;
                }

                let valOrError = yield files.deleteFile(target.id);
                assert.isOk(valOrError);
                assert.isOk(valOrError.val, valOrError.error);
                let fileDeleted = valOrError.val;

                assert.equal(fileDeleted.id, target.id);
                results = yield files.getAllByChecksum(checksum);
                assert.isOk(results);
                fetchedFileList = [...results];
                assert.isOk(fetchedFileList);

                let fileNumber2 = fetchedFileList.length;

                assert.equal((fileNumber1 - fileNumber2), 1);

                let isNotDeleted = yield fileUtils.datafilePathExists(baseFileId);

                if (fileNumber2 > 0) {
                    let message = `Physical file for id ${baseFileId} unexpectedly missing`;
                    assert(isNotDeleted, message);
                    continueFlag = true;
                } else {
                    let message = `Physical file for id ${baseFileId} was not deleted`;
                    assert.isFalse(isNotDeleted, message);
                    continueFlag = false;
                }

            }
        });
    });
});

function* setupProject() {

    let results = yield testHelpers.createProject(random_name(), user);
    assert.isOk(results);
    assert.isOk(results.val);
    let project = results.val;
    assert.equal(project.owner, userId);

    return project;

}