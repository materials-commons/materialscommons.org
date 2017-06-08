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

let base_project_name = "Test doi - ";

let project = null;
let experiment = null;
let processList = null;
let dataset1 = null;
let dataset2 = null;

let doiPublisher = process.env.MC_DOI_PUBLISHER;
let doiNamespace = process.env.MC_DOI_NAMESPACE;
let doiUser = process.env.MC_DOI_USER;
let doiPassword = process.env.MC_DOI_PW;
let publicationURLBase = process.env.MC_DOI_PUBLICATION_BASE;
let doiUrl = process.env.MC_DOI_SERVICE_URL;

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

before(function*() {

    this.timeout(8000); // test setup can take up to 8 seconds

    // check for all env variables
    assert.isOk(doiPublisher, "Missing process.env.MC_DOI_PUBLISHER");
    assert.isOk(doiNamespace, "Missing process.env.MC_DOI_NAMESPACE");
    assert.isOk(doiUser, "Missing process.env.MC_DOI_USER");
    assert.isOk(doiPassword, "Missing process.env.MC_DOI_PW");
    assert.isOk(publicationURLBase, "Missing process.env.MC_DOI_PUBLICATION_BASE");
    assert.isOk(doiUrl, "Missing process.env.MC_DOI_SERVICE_URL");

    let namespaceErrorMessage =
        "The DOI tests can only be run on the DOI test namespace with the test user" +
        " and password; make sure that the env vailables are set correctly." +
        " if you are not sure, ask!";
    
    assert.equal(doiNamespace,'doi:10.5072/FK2',namespaceErrorMessage);
    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let results = yield testHelpers.createDemoTestProject(user);
    assert.isOk(results);
    assert.isOk(results.val);
    project = results.val.project;
    experiment = results.val.experiment;
    assert.equal(project.owner, userId);
    let name = random_name();
    let description = "Changed the name of the demo project to " + name;
    let updateData = {
        name: name,
        description: description
    };
    project = yield projects.update(project.id, updateData);

    processList = results.val.processList;
    let datasetList = yield testHelpers.createDatasetList(experiment, processList, user.id);
    assert.equal(datasetList.length, 2);
    dataset1 = datasetList[0];
    dataset2 = datasetList[1];

});

describe.skip('Feature - Dataset: ', function () {
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

            this.timeout(6000); // test can take up to 6 seconds

            assert.isOk(doiNamespace);
            assert.isOk(doiUser);
            assert.isOk(doiPassword);
            assert.isOk(publicationURLBase);
            assert.isOk(doiUrl);

            assert.isOk(dataset1);
            assert.isOk(dataset1.id);

            let createCall = "shoulder/" + doiNamespace;
            let url = doiUrl + createCall;

            let publisher = doiPublisher;
            let targetUrl = publicationURLBase + "#/details/" + dataset1.id;
            let creator = "Test Author";
            let title = "Test Title - " + project.name;
            let publicationYear = "2017";
            let description = "This is a test project in Materials commons used for " +
                "testing the the Mint command in the DOI API (REST) suite.";

            let body = "_target: " + targetUrl + "\n"
                + "datacite.creator: " + creator + "\n"
                + "datacite.title: " + title + "\n"
                + "datacite.publisher: " + publisher + "\n"
                + "datacite.publicationyear: " + publicationYear + "\n"
                + "datacite.description:" + description + "\n"
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

            let response = yield request(options);

            assert.isOk(response);

            let matches = response.match(/doi:\S*/i);
            let doi = matches[0];

            let status = yield r.table('datasets').get(dataset1.id).update({doi: doi});
            assert.equal(status.replaced, 1);

            let valOrError = yield datasets.getDataset(dataset1.id);
            assert.isOk(valOrError);
            assert.isOk(valOrError.val);
            let dataset = valOrError.val;
            assert.equal(dataset.doi, doi);
        });
        it("mints a new DOI and puts into dataset record", function*() {

            this.timeout(6000); // test can take up to 6 seconds

            let creator = "Test Author";
            let title = "Test Title - " + project.name;
            let publicationYear = "2017";
            let description = "This is a test project in Materials commons used for " +
                "testing the the Mint command in the DOI API (REST) suite.";

            let optionalArgs = {
                description: description
            };

            let valOrError =
                yield datasetDoi.doiMint(dataset2.id, title, creator, publicationYear, optionalArgs);
            assert.isOk(valOrError);
            assert.isOk(valOrError.val);
            let dataset = valOrError.val;
            assert.isOk(dataset.doi);
            let doi = dataset.doi;
            assert.isTrue(doi.startsWith("doi:10.5072/FK"));

            let link = yield datasetDoi.doiGetServerLink(dataset2.id);
            assert.isTrue(link.startsWith("https://ezid.lib.purdue.edu/id/doi:10.5072/FK"));

            let metadata = yield datasetDoi.doiGetMetadata(dataset2.id);
            assert.isOk(metadata);
            assert.isOk(metadata.success);
            assert.equal(metadata.success, doi);
            assert.equal(metadata['datacite.creator'], creator);
            assert.equal(metadata['datacite.publicationyear'], publicationYear);
            assert.equal(metadata['datacite.description'], description);

            let target = metadata['_target'];
            let expected_target = "http://mcpub.localhost/#/details/" + dataset2.id;
            assert.equal(target, expected_target);
        });
    });
});
