'use strict';
const mocha = require('mocha');
const it = mocha.it;
require('co-mocha');
// noinspection JSUnusedLocalSymbols
const _ = require('lodash');
const chai = require('chai');
// noinspection JSUnresolvedVariable
const assert = chai.assert;
// noinspection JSUnusedLocalSymbols
const should = chai.should();

// noinspection JSUnresolvedVariable, JSUnusedLocalSymbols
const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});
const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";
const build_project_base = mcapi_base + "/build-demo";

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
// noinspection JSUnusedLocalSymbols
const directories = require(backend_base + '/directories');
// noinspection JSUnusedLocalSymbols
const experiments = require(backend_base + '/experiments');
// noinspection JSUnusedLocalSymbols
const processes = require(backend_base + '/processes');
const experimentDatasets = require(backend_base + '/experiment-datasets');

// noinspection JSUnusedLocalSymbols
const helper = require(build_project_base + '/build-demo-project-helper');
// noinspection JSUnusedLocalSymbols
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

// noinspection SpellCheckingInspection
before(function* () {
    console.log("before experiments-delete-datasets-spec.js");
    this.timeout(80000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

//    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, demoProjectConf.datapathPrefix);
    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, process.cwd() + '/');
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

    console.log("done before experiments-delete-datasets-spec.js");
});

function* buildTestDatasets () {
    let processesToAdd = [
        {id: process_list[0].id}
    ];

    let processesToDelete = [];

    let datasetArgs = {
        title: "Test Dataset1",
        description: "Dataset for testing"
    };

    let result = yield experimentDatasets.createDatasetForExperiment(experiment.id, userId, datasetArgs);
    let dataset = result.val;
    assert.isOk(dataset);

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete);

    datasetArgs = {
        title: "Test Dataset2",
        description: "Dataset for testing"
    };

    result = yield experimentDatasets.createDatasetForExperiment(experiment.id, userId, datasetArgs);
    dataset = result.val;
    assert.isOk(dataset);

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete);

    result = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = result.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, 2);
    return dataset_list;
}

describe('Feature - Experiments: ', function () {
    describe('Delete Experiment - in parts: ', function () {
        it('deletes all datasets', function* () {
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            let dataset_list = yield buildTestDatasets();
            assert.isOk(dataset_list);
            assert.equal(dataset_list.length, 2);

            let hasPublishedDatasets = false;
            for (let i = 0; i < dataset_list.length; i++) {
                let dataset = dataset_list[i];
                if (dataset.published) {
                    hasPublishedDatasets = true;
                }
            }
            assert.isFalse(hasPublishedDatasets);

            for (let i = 0; i < dataset_list.length; i++) {
                let dataset = dataset_list[i];
                yield experimentDatasets.deleteDataset(dataset.id);
            }

            let result = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
            dataset_list = result.val;
            assert.isOk(dataset_list);
            assert.equal(dataset_list.length, 0);

        });
    });
});
