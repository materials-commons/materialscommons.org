'use strict';
require('mocha');
const it = require('mocha').it;
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

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
const experimentDatasets = require(backend_base + '/experiment-datasets');
const processes = require(backend_base + '/processes');

const testHelpers = require('./test-helpers');

const projectDelete = require(backend_base + '/project-delete');

let userId = "test@test.mc";
let user = null;

let project = null;
let experiment = null;
let processIdList = [];
let sampleIdList = [];
let fileIdList = [];
let datasetIdList = [];

before(function* () {

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);
});

describe('Feature - Projects: ', function () {
    describe('Delete Project: ', function () {
        it('does not delete a project with any published datasets', function* () {

            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            // publish one of the datasets
            let datasetId = datasetIdList[0];
            let results = yield experimentDatasets.publishDataset(datasetId);
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.published);
            assert(results.val.published);

            // delete project - fails
            results = yield projectDelete.deleteProject(project_id);
            assert.isOk(results);
            assert.isOk(results.error);

            yield testDatasets({assertExists: true});

        });
        it('does not delete a project if any dataset in any experiment has a DOI', function* () {
            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            // fake a doi on one of the datasets
            let datasetId = datasetIdList[0];
            let fakeDOI = "fakeDOI";
            let status = yield r.table('datasets').get(datasetId).update({doi: fakeDOI});
            if (status.replaced !== 1) {
                assert.fail(`Update of DOI in dataset, ${datasetId}, failed.`);
            }

            // delete project - fails
            let results = yield projectDelete.deleteProject(project_id);
            assert.isOk(results);
            assert.isOk(results.error);

            yield testDatasets({assertExists: true});
        });
        it('supports a dry run mode', function* () {
            this.timeout(8000); // test take up to 8 seconds

            yield createRenamedDemoProject();

            let dryRun = true;

            assert.isOk(project);
            let project_id = project.id;
            assert.isOk(project_id);

            let results = yield projectDelete.deleteProject(project_id, {dryRun: dryRun});
            assert.isOk(results);
            let tally = results.val;
            assert.isOk(tally);

            yield checkTally(tally, project_id);
            yield confirmDemoProjectCoverage(tally, {dryRun: dryRun})

        });
        it('deletes the indicated project', function* () {
            this.timeout(120000); // test take up to 12 seconds

            yield createRenamedDemoProject();

            let dryRun = false;

            assert.isOk(project);
            let project_id = project.id;
            assert.isOk(project_id);

            let results = yield projectDelete.deleteProject(project_id, {dryRun: dryRun});
            assert.isOk(results);
            let tally = results.val;
            assert.isOk(tally);

            yield checkTally(tally, project_id);
            yield confirmDemoProjectCoverage(tally, {dryRun: dryRun})

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
    assert.equal(processIdList.length, 5);

    let fileList = results.fileList;
    fileIdList = [];
    fileList.forEach((file) => {
        fileIdList.push(file.id);
    });
    assert.equal(fileIdList.length, 16);

    datasetIdList = [];
    let datasetList = yield testHelpers.createDatasetList(experiment, processList, userId);
    datasetList.forEach((dataset) => {
        datasetIdList.push(dataset.id);
    });
    assert.equal(datasetIdList.length, 2);

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
    assert.equal(sampleIdList.length, 8);

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

function* checkTally(tally, projectId) {

    let experimentCount = 1;
    let datasetCount = 2;
    let fileCount = 16;
    let sampleCount = 8;

    assert.isOk(tally.project);
    assert.equal(tally.project.id, projectId);

    assert.isOk(tally.experiments);
    assert.equal(tally.experiments.length, experimentCount);

    // assert.isOk(tally.datasets);
    // assert.equal(tally.datasets.length, datasetCount);

    assert.isOk(tally.files);
    assert.equal(tally.files.length, fileCount);

    assert.isOk(tally.samples);
    assert.equal(tally.samples.length, sampleCount);

}

function* confirmDemoProjectCoverage(tally, options) {

    let dryRun = options && options.dryRun;

    yield checkLinks(options);

    yield testDatasets({assertExists: dryRun});

    yield testProcesses({assertExists: dryRun});

    yield testSamples({assertExists: dryRun});

    yield testFiles({assertExists: dryRun});

    yield testProject({assertExists: dryRun});

}

function* checkLinks(options) {

    let forDryRun = options && options.dryRun;

    let tables = [
        'project2datadir',
        'project2datafile',
        'project2experiment',
        'project2process',
        'project2sample',
        'access'
    ];

    if (forDryRun) {
        let lengths = [4, 16, 1, 5, 8, 1];
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            let list = yield r.table(table).getAll(project.id, {index: 'project_id'});
            let expectedLength = lengths[i];
            let l = list.length;
            let message = `missing links in ${table} for project id = ${project.id}`;
            assert.equal(l, expectedLength, message);
        }

    } else {
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            let list = yield r.table(table).getAll(project.id, {index: 'project_id'});
            let l = list.length;
            let message = `expected no links in ${table}, `
                + `but found ${l} links for project id = ${project.id}`;
            assert.equal(l, 0, message);
        }
    }
}

function* testSamples(options) {

    let sampleCount = 0;
    if (options && options.assertExists) {
        sampleCount = 8;
    }

    let probeList = yield r.table('samples').getAll(r.args(sampleIdList));
    assert.isOk(probeList);
    assert.equal(probeList.length, sampleCount, "samples table");

}

function* testProcesses(options) {

    let processCount = 0;
    if (options && options.assertExists) {
        processCount = 5;
    }

    let probeList = yield yield r.table('processes').getAll(r.args(processIdList));
    assert.isOk(probeList);
    assert.equal(probeList.length, processCount, "processes table");

}

function* testFiles(options) {
    let count = 0;

    if (options && options.assertExists) {
        count = 16;
    }

    let list = yield r.table('datafiles').getAll(r.args(fileIdList));
    assert.isOk(list);
    assert.equal(list.length, count, "files table");

}

function* testProject(options) {
    let count = 0;

    if (options && options.assertExists) {
        count = 1;
    }

    let idList = [project.id];
    let list = yield r.table('projects').getAll(r.args(idList));
    assert.isOk(list);
    assert.equal(list.length, count, "projects table");

}
