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
const db_model = backend_base + '/servers/mcapi/db/model/';
const dbModelUsers = require(db_model + 'users');
const projects = require(db_model + 'projects');
const directories = require(db_model + 'directories');
const files = require(db_model + 'files');

const testHelpers = require('./test-helpers');

const base_project_name = "Test file project - ";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";
let user = null;

let project = null;

before(function* () {
    console.log('before files-version-special-spec.js');
    this.timeout(80000); // setup can take up to 8 seconds

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let results = yield testHelpers.createProject(random_name(), user);
    assert.isOk(results);
    assert.isOk(results.val);
    project = results.val;
    assert.equal(project.owner, userId);
    console.log('done before files-version-special-spec.js');
});

describe('Feature - Files: ', function () {
    describe('Versioning', function () {
        it('supports different versions of the file - different directories', function* () {
            let file1 = yield testHelpers.createFileFromDemoFileSet(project, 1, user);
            assert.isOk(file1);
            assert.equal(file1.owner, userId);
            let file2 = yield testHelpers.createFileFromDemoFileSet(project, 2, user);
            assert.isOk(file2);
            assert.equal(file2.owner, userId);
            let file3 = yield testHelpers.createFileFromDemoFileSet(project, 3, user);
            assert.isOk(file3);
            assert.equal(file3.owner, userId);

            // file 2 moved to a different directory
            let top_directory = yield directories.get(project.id, 'top');
            let from_dir = '/';
            let path = 'SubDir/AnotherDir';
            let dir_args = {
                from_dir: from_dir,
                path: path
            };
            let result = yield directories.create(project.id, project.name, dir_args);
            assert.isTrue(result.hasOwnProperty('val'));
            let dir_list = result.val;
            assert.equal(dir_list.length, 2);
            assert.equal(dir_list[0].name, project.name + '/SubDir');
            assert.equal(dir_list[1].name, project.name + '/SubDir/AnotherDir');

            let targetDir = dir_list[1];

            let updateArgs = {
                move: {
                    new_directory_id: targetDir.id,
                    old_directory_id: top_directory.id
                }
            };

            yield files.update(file2.id, project.id, user, updateArgs);

            let fileProbe = yield directories.fileInDirectoryByName(targetDir.id, file2.name);
            assert.isOk(fileProbe);
            assert.equal(fileProbe.owner, userId);
            assert.equal(fileProbe.id, file2.id);

            // create faked versions of file3
            let fileWithVersion = yield files.pushVersion(file2, file1);
            assert.isOk(fileWithVersion);
            assert.equal(fileWithVersion.id, file2.id);
            assert.isOk(fileWithVersion.parent);
            assert.equal(fileWithVersion.parent, file1.id);
            let otherVersion = yield files.get(fileWithVersion.parent);
            assert.isOk(otherVersion);
            assert.equal(otherVersion.id, file1.id);
            assert.isFalse(otherVersion.current);
            assert.isTrue(fileWithVersion.current);

            fileWithVersion = yield files.pushVersion(file3, file2);
            assert.isOk(fileWithVersion);
            assert.equal(fileWithVersion.id, file3.id);
            assert.isOk(fileWithVersion.parent);
            assert.equal(fileWithVersion.parent, file2.id);
            otherVersion = yield files.get(fileWithVersion.parent);
            assert.isOk(otherVersion);
            assert.equal(otherVersion.id, file2.id);
            assert.isFalse(otherVersion.current);
            assert.isTrue(fileWithVersion.current);

            // versions are still available
            let versions = yield files.getVersions(fileWithVersion.id);
            assert.isOk(versions);
            assert.isOk(versions.val);
            let probe = versions.val;
            assert.equal(probe.length, 2, "Some versions of the file are missing");

            assert.equal(probe[0].id, file2.id);
            assert.equal(probe[1].id, file1.id);

        });
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

/* updates:
 name
 description
 tags
 notes
 processes
 samples
 move
 */
