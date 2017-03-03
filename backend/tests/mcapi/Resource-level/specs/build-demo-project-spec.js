'use strict';
require('mocha');
import {it} from 'mocha';
require('co-mocha');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();
const fs = require('fs');
const os = require('os')
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const files = require(backend_base + '/servers/mcapi/db/model/files');
const users = require(backend_base + '/servers/mcapi/resources/users');
const helper = require(backend_base + '/servers/lib/build-demo-project-helper');
const fileUtils = require(backend_base + '/servers/lib/create-file-utils');

const fullname = "Test User";
const user_apikey = "ThisIsAJunkKey";
const user1Id = "mctest@mc.org";

const base_project_name = "Demo project test: ";

const demoProjectTestUserId = 'test@test.mc';
const demoProjectTestUserKey = "totally-bogus";
const demoProjectName = "Demo Project";
const demoProjectDescription = "A project for trying things out.";
const demoProjectExperimentName = "Demo: Microsegregation in HPDC L380";
const dmeoProjectExperimentDescription =
    "A demo experiment -  A study of microsegregation in High Pressure Die Cast L380.";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

before(function*() {
    let user = yield dbModelUsers.getUser(user1Id);
    if (!user) {
        let results = yield r.db('materialscommons').table('users').insert({
            admin: false,
            affiliation: "",
            avatar: "",
            description: "",
            email: user1Id,
            apikey: user_apikey,
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

describe('Feature - User - Build Demo Project Support: ', function() {
    describe('User for test',function() {
        it('exists', function * (){
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user exists");
            assert.equal(user.apikey,user_apikey);
            assert.equal(user.id,user1Id);
            assert.equal(user.name,fullname);
        })
    });
    describe('List of files for build',function() {
        it('exists in folder', function *() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumAndFilename = helper.filesDescriptions()[i];
                let expectedChecksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + datapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
            }
        });
        it('can be inserted in database', function*() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user,"test user exists");
            let projectName = random_name();
            let attrs = {
                name: projectName,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user,attrs);
            let project = ret.val;
            assert.equal(projectName,project.name);
            assert.equal(user.id,project.owner);
            let top_directory =  yield directories.get(project.id,'top');
            assert.equal(top_directory.otype, "directory");
            assert.equal(top_directory.name, project.name);
            let tempDir = os.tmpdir();
            let fileResults = {};
            let fileCount = 0;
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumFilenameAndMimetype = helper.filesDescriptions()[i];
                let expectedChecksum = checksumFilenameAndMimetype[0];
                let filename = checksumFilenameAndMimetype[1];
                let mimetype = checksumFilenameAndMimetype[2];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + datapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
                let stats = fs.statSync(path);
                let fileSizeInBytes = stats.size;
                let source = yield copyOne(path,tempDir);
                path = source.path;
                let args = {
                    name: filename,
                    checksum: checksum,
                    mediatype: fileUtils.mediaTypeDescriptionsFromMime(mimetype),
                    filesize: fileSizeInBytes,
                    filepath: path
                };
                let file = yield directories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
                should.exist(file);
                assert.equal(file.name,filename);
                assert.equal(file.checksum,checksum);
                fileResults[file.checksum] = file;
            }
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumFilenameAndMimetype = helper.filesDescriptions()[i];
                let expectedChecksum = checksumFilenameAndMimetype[0];
                let filename = checksumFilenameAndMimetype[1];
                let file = fileResults[expectedChecksum];
                should.exist(file, "file with filname = " + filename + " in not in the results");
                assert.equal(file.name,filename);
            }
        });
        it('is in the database', function*() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumAndFilename = helper.filesDescriptions()[i];
                let checksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let fileList = yield files.getAllByChecksum(checksum);
                let file = null;
                for (let i = 0; i < fileList.length; i++) {
                    if (! fileList[i].usesid) file = fileList[i];
                }
                assert(file,"Missing original file for " + filename);
                file = yield files.get(file.id);
                assert(file.name == filename, "Filename for file by checksum for filename = " + filename +
                    "; with checksum = " + checksum + "; expected " + filename + " but found " + file.name);
            }
        });
    });
    describe('Build Demo Project helper supporting functions',function () {
        it('checkes for missing files in folder', function*() {
            let missingFiles = yield helper.filesMissingInFolder();
            assert.lengthOf(missingFiles, 0);
        });
        it('adds all files to top dir of a test Demo Project', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user, "test user exists");

            let projectName = random_name();
            let attrs = {
                name: projectName,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user, attrs);
            let project = ret.val;
            assert.equal(projectName, project.name);
            assert.equal(user.id, project.owner);

            yield helper.addAllFiles(user, project);
            let files = yield helper.filesForProject(project);
            assert.lengthOf(files, helper.filesDescriptions().length);

            let missingFiles = yield helper.filesMissingInDatabase(project);
            assert.lengthOf(missingFiles, 0);

        });
    });
    describe('Build Demo Project helper main functions',function (){
        it('demo project test user exists', function * (){
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user,"test user exists");
            assert.equal(user.id,demoProjectTestUserId);
            assert.equal(user.name,demoProjectTestUserId);
            assert.equal(user.apikey,demoProjectTestUserKey);
        })
        it('finds or creates the Demo Project', function* (){
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user,"test user exists");
            assert.equal(user.id, demoProjectTestUserId);

            // Note create project returns the project if it already exists, by name
            // It does not create a duplicate!
            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error,"Unexpected error from createDemoProjectForUser: " + valOrError.error);

            let project = valOrError.val;
            assert.isNotNull(project,"project is not null");
            assert.equal(project.otype, "project");
            assert.equal(project.name,demoProjectName);
            assert(project.description.includes(demoProjectDescription)); // may have been turned into html!!
            assert.equal(project.owner,demoProjectTestUserId);
        });
        it('finds or creates the Demo Project Experiment', function*(){
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user,"test user exists");
            assert.equal(user.id, demoProjectTestUserId);

        });
    });
});


