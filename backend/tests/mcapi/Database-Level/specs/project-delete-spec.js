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

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
const experimentDatasets = require(backend_base + '/experiment-datasets');


const testHelpers = require('./test-helpers');

const projectDelete = require(backend_base + '/project-delete');

let userId = "test@test.mc";
let user = null;

let project = null;
let experiment = null;
let processList = null;
let sampleList = null;
let fileList = null;
let datasetList = null;
let experimentNote = null;
let experimentTask = null;
let reviews_count = 0;
let notes_count = 0;

before(function*() {

    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);
});

describe('Feature - Projects: ', function () {
    describe('Delete Project: ', function () {
        it('does not delete a project with any published datasets', function*() {

            this.timeout(8000); // test take up to 8 seconds

            yield setup();

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            let idList = [];
            for (let i = 0; i < datasetList.length; i++) {
                idList.push(datasetList[i].id);
            }

            yield testDatasets({assertExists: true});

            // publish one of the datasets
            let datasetId = idList[0];
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
        it('supports a dry run mode', function*() {
            this.timeout(8000); // test take up to 8 seconds

            yield setup();

            let dryRun = true;

            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            let results = yield projectDelete.deleteProject(project_id, {dryRun: dryRun});
            assert.isOk(results);
            let tally = results.val;
            assert.isOk(tally);

            //yield checkTally(tally, project_id);
            //yield confirmDemoProjectCoverage(tally, {dryRun: dryRun})

        });
        it('deletes the indicated project')
    });
});


function* setup() {

    // create a renamed demo project for testing
    let valOrError = yield testHelpers.createDemoTestProject(user);
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    processList = results.processList;
    sampleList = results.sampleList;
    fileList = results.fileList;

    assert.equal(project.otype, "project");
    assert.equal(project.owner, userId);

    datasetList = yield testHelpers.createDatasetList(experiment, processList, userId);

    // Note: create fake sample that is not part of a process for testing
    results = yield r.table('samples').insert({'name': 'fake sample', 'otype': 'sample', 'owner': 'noone'});
    let key = results.generated_keys[0];
    yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment.id});
    yield r.table('project2sample').insert({sample_id: key, project_id: project.id});

    console.log('Project name: ', project.name);
    console.log('Experiment id: ', experiment.id);
}

function* testDatasets(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 2;
    }

    let idList = [];
    for (let i = 0; i < datasetList.length; i++) {
        idList.push(datasetList[i].id);
    }

    let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = check.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, count);

    check = yield r.table('dataset2process').getAll(r.args([...idList]), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, count);

    check = yield r.table('experiment2dataset').getAll(r.args([...idList]), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, count);
}

function* checkTally(tally, projectId) {

    let experimentCount = 1;
    let datasetCount = 2;
    let fileCount = 16;
    let sampleCount = 1;

    assert.isOk(tally.project);
    assert.equal(tally.project.id,projectId);

    console.log(tally.project);

    assert.isOk(tally.experiments);
    assert.equal(tally.experiments.length, experimentCount);

    assert.isOk(tally.datasets);
    assert.equal(tally.datasets.length, datasetCount);

    assert.isOk(tally.files);
    assert.equal(tally.files.length, fileCount);

    assert.isOk(tally.samples);
    assert.equal(tally.samples.length, sampleCount);

}

function* confirmDemoProjectCoverage(project, tally, options) {

    let dryRun = options && options.dryRun;

    yield checkLinks(projectId,{dryRun: dryRun});
}

function* checkLinks(projectId, options){

    let forDryRun = options && options.forDryRun;

    let tables = [
        'project2datadir' ,
        'project2datafile' ,
        'project2experiment' ,
        'project2process' ,
        'project2sample'
    ];

    if (forDryRun) {
        let lengths = [2,16,1,5,8];
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            let list = yield r.table(table).getAll(experiment_id, {index: 'experiment_id'});
            let expectedLength = lengths[i];
            let l = list.length;
            let message = `missing links in ${table} for experment id = ${experiment_id}`
            assert.equal(l,expectedLength,message);
        }

    } else {
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            let list = yield r.table(table).getAll(experiment_id,{index: 'experiment_id'});
            let l = list.length;
            let message = `expected no links in ${table}, but found ${l} for experment id = ${experiment_id}`
            assert.equal(l,0,message);
        }
    }
}

