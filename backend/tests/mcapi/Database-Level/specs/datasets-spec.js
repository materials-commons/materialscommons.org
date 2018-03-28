'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const experimentDatasets = require(backend_base + '/servers/mcapi/db/model/experiment-datasets');
const processes = require(backend_base + '/servers/mcapi/db/model/processes');

const testHelpers = require('./test-helpers');

let userId = "test@test.mc";
let user = null;

let project = null;
let experiment = null;
let processIdList = [];
let sampleIdList = [];
let fileIdList = [];
let datasetIdList = [];

before(function*() {

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);
});

describe('Feature - dataset: ', function () {
    describe('Delete Dataset: ', function () {
        it('deletes a dataset', function* (){
            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
            let dataset_list = check.val;
            let dataset = dataset_list[0];
            let expected_count = dataset_list.length - 1;
            assert.isFalse(dataset.published);

            let results = yield experimentDatasets.deleteDataset(dataset.id);
            assert.isTrue(results.val);

            check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
            dataset_list = check.val;
            assert.equal(dataset_list.length, expected_count);

        });
        it('does not delete a published dataset', function*() {

            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            // publish one of the datasets
            let datasetId = datasetIdList[0];
            let expected_count = datasetIdList.length;
            let results = yield experimentDatasets.publishDataset(datasetId);
            assert.isOk(results);
            assert.isOk(results.val);
            let dataset = results.val;
            assert.isOk(dataset.published);
            assert.isTrue(dataset.published);
            assert.equal(dataset.id,datasetId);

            results = yield experimentDatasets.getDataset(datasetId);
            assert.isOk(results);
            assert.isOk(results.val);
            dataset = results.val;
            assert.isTrue(dataset.published);
            assert.isFalse(!!dataset.doi);

            // delete database fails
            results = yield experimentDatasets.deleteDataset(datasetId);
            assert.isFalse(results.val);

            let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
            let dataset_list = check.val;
            assert.equal(dataset_list.length, expected_count);

            yield testDatasets({assertExists: true});

        });
        it('does not delete a dataset with an assigned DOI', function*() {
            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            // fake a doi on one of the datasets
            let datasetId = datasetIdList[0];
            let expected_count = datasetIdList.length;
            let fakeDOI = "fakeDOI";
            let status = yield r.table('datasets').get(datasetId).update({doi: fakeDOI});
            if (status.replaced != 1) {
                assert.fail(`Update of DOI in dataset, ${datasetId}, failed.`);
            }

            // delete database fails
            let results = yield experimentDatasets.deleteDataset(datasetId);
            assert.isFalse(results.val);

            let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
            let dataset_list = check.val;
            assert.equal(dataset_list.length, expected_count);

            yield testDatasets({assertExists: true});

        });
    });
});

function* createRenamedDemoProject() {

    // create a renamed demo project for testing
    let valOrError = yield testHelpers.createDemoTestProject(user);
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    assert.equal(project.otype, "project");
    assert.equal(project.owner, userId);

    let processList = results.processList;
    processIdList = [];
    processList.forEach((process) => {
        processIdList.push(process.id);
    });
    assert.equal(processIdList.length,5);

    let fileList = results.fileList;
    fileIdList = [];
    fileList.forEach((file) => {
        fileIdList.push(file.id);
    });
    assert.equal(fileIdList.length,16);

    datasetIdList = [];
    let datasetList = yield testHelpers.createDatasetList(experiment, processList, userId);
    datasetList.forEach((dataset) => {
        datasetIdList.push(dataset.id);
    });
    assert.equal(datasetIdList.length,2);

    // Note: create fake sample that is not part of a process for testing
    results = yield r.table('samples').insert({'name': 'fake sample', 'otype': 'sample', 'owner': 'noone'});
    let key = results.generated_keys[0];
    yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment.id});
    yield r.table('project2sample').insert({sample_id: key, project_id: project.id});

    sampleIdList = yield r.table('project2sample')
        .getAll(project.id, {index: 'project_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .getField('sample_id');
    assert.isOk(sampleIdList);
    assert.equal(sampleIdList.length,8);

}

function* testDatasets(options) {

    let datasetCount = 0;
    let processCount = 0;
    let experimentCount = 0;
    if (options && options.assertExists) {
        datasetCount = 2;
        processCount = 10;
        experimentCount = 2;
    }

    let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = check.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, datasetCount);

    check = yield r.table('dataset2process').getAll(r.args(datasetIdList), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, processCount);

    check = yield r.table('experiment2dataset').getAll(r.args(datasetIdList), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, experimentCount);
}
