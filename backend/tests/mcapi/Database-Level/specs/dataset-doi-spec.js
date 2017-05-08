'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const request = require('request-promise');

const backend_base = '../../../..';
const model_base = backend_base + '/servers/mcapi/db/model/';
const dbModelUsers = require(model_base + 'users');
const projects = require(model_base + 'projects');
const datasetDoi = require(model_base + 'experiment-datasets-doi');
const datasets = require(model_base + 'experiment-datasets');

const testHelpers = require('./test-helpers');

let userId = "test@test.mc";
let user = null;

let project = null;
let experiment = null;
let processList = null;
let datasetList = null;

let doiNamespace = process.env.DOINAMESPACE;
let doiUser = process.env.DOITESTUSER;
let doiPassword = process.env.DOITESTPW;
let publicationURLBase = process.env.DOIPUBLICATIONBASE;
let doiUrl = process.env.DOISERVICEURL;

before(function*() {

    this.timeout(8000); // test setup can take up to 8 seconds

    // check for all env variables
    assert.isOk(doiNamespace, "Missing process.env.DOINAMESPACE");
    assert.isOk(doiUser, "Missing process.env.DOITESTUSER");
    assert.isOk(doiPassword, "Missing process.env.DOITESTPW");
    assert.isOk(publicationURLBase, "Missing process.env.DOIPUBLICATIONBASE");
    assert.isOk(doiUrl, "Missing process.env.DOISERVICEURL");

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let results = yield testHelpers.createDemoTestProject(user);
    assert.isOk(results);
    if (results.error) {
        console.log(results);
    }
    assert.isOk(results.val);
    project = results.val.project;
    experiment = results.val.experiment;
    assert.equal(project.owner, userId);
    console.log("Test project name: " + project.name);
    console.log("Test project id: " + project.id);
    console.log("Test experiment name: " + experiment.name);
    console.log("Test experiment id: " + experiment.id);

    processList = results.val.processList;
    datasetList = yield testHelpers.createDatasetList(experiment, processList, user.id);
    console.log(datasetList.length);
});

describe('Feature - Dataset: ', function () {
    describe('DOI Request - ', function () {
        it('checks DOI server status - raw', function*() {

            let url = doiUrl + "status";
            let options = {
                method: 'GET',
                uri: url,
                resolveWithFullResponse: true
            };
            let response = yield request(options);
            assert.isOk(response);
            assert.isOk(response.statusCode);
            assert.equal(response.statusCode, "200");
            assert.isOk(response.body);
            assert.equal(response.body, "success: EZID is up");
        });
        it('calls function to get DOI server status', function*() {
            let ok = yield datasetDoi.doiServerStatusIsOK();
            assert.isOk(ok);
            assert(ok);
        });
        it('creates a test DOI - raw', function*() {

            this.timeout(4000); // test can take up to 4 seconds

            assert.isOk(doiNamespace);
            assert.isOk(doiUser);
            assert.isOk(doiPassword);
            assert.isOk(publicationURLBase);
            assert.isOk(doiUrl);

            let dataset = datasetList[1];

            assert.isOk(dataset);
            assert.isOk(dataset.id);

            let createCall = "shoulder/" + doiNamespace;
            let url = doiUrl + createCall;

            let creator = "Test Author";
            let title = "Test Title - " + project.name;
            let publisher = "Materials Commons - testing";
            let publicationYear = "2017";
            let targetUrl = publicationURLBase + "#/details/" + dataset.id;

            let body = "_target: " + targetUrl + "\n"
                + "datacite.creator: " + creator + "\n"
                + "datacite.title: " + title + "\n"
                + "datacite.publisher: " + publisher + "\n"
                + "datacite.publicationyear: " + publicationYear + "\n"
                + "datacite.resourcetype: Dataset";

            let options = {
                method: 'POST', // POST = Mint operation
                body: body,
                uri: url,
                auth: {
                    user: doiUser,
                    pass: doiPassword,
                    sendImmediately: false
                },
                headers: {'Content-Type': 'text/plain'}
            };

            let response = null;
            response = yield request(options);

            assert.isOk(response);

            let matches = response.match(/doi:\S*/i);
            let doi = matches[0];
            // let link = doiUrl + "id/" + doi;

            console.log('Dataset id: ', dataset.id);
            console.log('DOI: ',doi);

            let status = yield r.table('datasets').get(dataset.id).update({doi: doi})
            assert.equal(status.replaced,1);

            let valOrError = yield datasets.getDataset(dataset.id);
            assert.isOk(valOrError);
            assert.isOk(valOrError.val);
            dataset = valOrError.val;
            assert.equal(dataset.doi, doi);
        });
    });
});
