'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;
const should = chai.should();

const os = require('os');
const fs = require('fs');
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../..';
const fileUtils = require(backend_base + '/servers/lib/create-file-utils');
const mcapi_base = backend_base + '/servers/mcapi';
const dbModelUsers = require(mcapi_base + '/db/model/users');
const projects = require(mcapi_base + '/db/model/projects');
const directories = require(mcapi_base + '/db/model/directories');
const helper = require(mcapi_base + '/build-demo/build-demo-project-helper');
const demoProjectConf = require(mcapi_base + '/build-demo/build-demo-project-conf');

const base_project_name = "File Conversion test project ";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";
let user, project, top_directory;

before(function*() {
    user = yield dbModelUsers.getUser(userId);
    let project_name = random_name();
    console.log("project name: ", project_name);
    assert.isNotNull(user,"test user exists");
    let attrs = {
        name: project_name,
        description: "This is a test project for automated testing."
    };
    let ret = yield projects.createProject(user,attrs);
    project = ret.val;
    assert.isNotNull(project,"test project");
    assert.equal(project.otype, "project");
    assert.equal(project.name, project_name);
    assert.equal(project.owner, user.id);
    assert.equal(project.owner, userId);
    assert.equal(project.users.length,1);
    assert.equal(project.users[0].user_id, userId);
    top_directory = yield directories.get(project.id, 'top');
    assert.equal(top_directory.otype, "directory");
    assert.equal(top_directory.name, project.name);
});

describe('Feature - File Conversion: ', function() {
    it('create office file for conversion', function*(){
        let tempDir = os.tmpdir();
        let checksumFilenameAndMimetype = helper.filesDescriptions()[2];
        let expectedChecksum = checksumFilenameAndMimetype[0];
        let filename = checksumFilenameAndMimetype[1];
        let mimetype = checksumFilenameAndMimetype[2];
        let path = `../${demoProjectConf.fullDatapath}/${filename}`;
        assert(fs.existsSync(path),
            "missing test datafile " + path);
        let checksum = yield md5File(path);
        assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
            filename + "; but expected " + expectedChecksum + " and got " + checksum);
        let stats = fs.statSync(path);
        let fileSizeInBytes = stats.size;
        let source = yield copyOne(path, tempDir);
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
        assert.equal(file.name, filename);
        assert.equal(file.checksum, checksum);
    });
    it('create single image file for conversion', function*(){
        let tempDir = os.tmpdir();
        let checksumFilenameAndMimetype = helper.filesDescriptions()[5];
        let expectedChecksum = checksumFilenameAndMimetype[0];
        let filename = checksumFilenameAndMimetype[1];
        let mimetype = checksumFilenameAndMimetype[2];
        let path = `../${demoProjectConf.fullDatapath}/${filename}`;
        assert(fs.existsSync(path),
            "missing test datafile " + path);
        let checksum = yield md5File(path);
        assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
            filename + "; but expected " + expectedChecksum + " and got " + checksum);
        let stats = fs.statSync(path);
        let fileSizeInBytes = stats.size;
        let source = yield copyOne(path, tempDir);
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
        assert.equal(file.name, filename);
        assert.equal(file.checksum, checksum);
    });
});
