'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const request = require('request-promise');

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const model_base = backend_base + '/servers/mcapi/db/model/';
const dbModelUsers = require(model_base + 'users');
const projects = require(model_base + 'projects');
const datasetDoi = require(model_base + 'experiment-datasets-doi');

const testHelpers = require('./test-helpers');

const base_project_name = "Test doi - ";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";
let user = null;

let project = null;

let doiUrl = "https://ezid.lib.purdue.edu/";

before(function*() {

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let results = yield testHelpers.createProject(random_name(),user);
    assert.isOk(results);
    assert.isOk(results.val);
    project = results.val;
    assert.equal(project.owner,userId);

});

describe('Feature - Dataset: ', function() {
    describe('DOI Request - ', function () {
        it('checks DOI server status - raw', function* () {
            let url = doiUrl + "status"
            let options = {
                method: 'GET',
                uri: url,
                resolveWithFullResponse: true
            };
            let response = yield request(options);
            assert.isOk(response);
            assert.isOk(response.statusCode);
            assert.equal(response.statusCode,"200");
            assert.isOk(response.body);
            assert.equal(response.body,"success: EZID is up");
        });
        it('checks DOI server status - backend', function* () {
            let ok = yield datasetDoi.doiServerStatusIsOK();
        });
        it('creates a test DOI', function* () {
            let title = "Test DOI - Title";
            let author = "First Author";
            let date = "2017";
            let description = "The is a test description";
            let other = {
                description: description,
                test: true
            };
            let datasetId = null;
            console.log("Other args: ", other);
            let response = yield datasetDoi.doiCreate(datasetId, title, author, date, other);
            assert.isOk(response);
            assert.isOk(response.statusCode);
            assert.equal(response.statusCode,"200");
            assert.isOk(response.body);
            console.log(response.body);
        })
    });
});
