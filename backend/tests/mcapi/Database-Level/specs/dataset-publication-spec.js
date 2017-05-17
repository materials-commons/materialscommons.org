'use strict';
require('mocha');
import {it} from 'mocha';
require('co-mocha');
const _ = require('lodash');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});
const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";
const build_project_base = mcapi_base + "/build-demo";

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
const directories = require(backend_base + '/directories');
const experiments = require(backend_base + '/experiments');
const processes = require(backend_base + '/processes');
const experimentDatasets = require(backend_base + '/experiment-datasets');

const helper = require(build_project_base + '/build-demo-project-helper');
const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
const buildDemoProject = require(build_project_base + '/build-demo-project');

const base_project_name = "Test directory";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let process_list = null;
let sample_list = null;
let file_list = null;
let dataset1 = null;
let dataset2 = null;

before(function*() {

    this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, demoProjectConf.datapathPrefix);
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    process_list = results.processes;
    sample_list = results.samples;
    file_list = results.files;

    let project_id = project.id;
    let experiment_id = experiment.id;

    let name = random_name();
    let description = "Changed the name of the demo project to " + name;
    let updateData = {
        name: name,
        description: description
    };
    let updated_project = yield projects.update(project.id, updateData);
    assert.equal(updated_project.otype, "project");
    assert.equal(updated_project.owner, userId);
    assert.equal(updated_project.name, name);
    assert.equal(updated_project.description, description);
    assert.equal(updated_project.id, project_id);
    project = updated_project;

    console.log("Project name: " + project.name);

    let processesToAdd = [
        {id: process_list[0].id}
    ];

    let processesToDelete = [];

    let datasetArgs = {
        title: "Test Dataset1",
        description: "Dataset for testing"
    };

    let result = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    dataset1 = result.val;
    assert.isOk(dataset1);

    yield experimentDatasets.updateProcessesInDataset(dataset1.id, processesToAdd, processesToDelete);

    datasetArgs = {
        title: "Test Dataset2",
        description: "Dataset for testing"
    };

    result = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    dataset2 = result.val;
    assert.isOk(dataset2);

    results = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
    let dataset_list = results.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, 2);

});

describe('Feature - Datasets: ', function () {
    describe('publication: ', function () {
        it("publishes a dataset with processes and samples",function* (){
            let results = yield experimentDatasets.publishDataset(dataset1.id);
            assert.isOk(results);
            assert.isOk(results.val);
            let dataset = results.val;
            assert.equal(dataset.otype,'dataset');
            assert.isTrue(dataset.published);
        });
        it("will not publish a dataset without processes or samples", function* (){
            let results = yield experimentDatasets.publishDataset(dataset2.id);
            console.log(results);
            assert.isOk(results);
            assert.isOk(results.val);
        });
    });
});