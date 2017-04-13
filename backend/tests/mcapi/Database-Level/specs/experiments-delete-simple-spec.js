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
const samples = require(backend_base + '/samples');

const helper = require(build_project_base + '/build-demo-project-helper');
const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
const buildDemoProject = require(build_project_base + '/build-demo-project');

const testHelpers = require('./test-helpers');

const experimentDelete = require(backend_base + '/experiment-delete');

const base_project_name = "Test directory";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let processList = null;
let sampleList = null;
let fileList = null;
let datasetList = null;
let experimentNote = null;
let experimentTask = null;

beforeEach(function*() {

    this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId,user.id);

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

    datasetList = yield testHelpers.createDatasetList(experiment,processList,userId);

    // Note: create fake sample that is not part of a process for testing
    results = yield r.table('samples').insert({'name':'fake sample', 'otype':'sample', 'owner':'noone'})
    let key = results.generated_keys[0];
    yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment.id});

    experimentNote = yield testHelpers.setUpFakeExperimentNoteData(experiment.id,userId);
    experimentTask = yield testHelpers.setUpAdditionalExperimentTaskData(experiment.id,userId);

});

describe('Feature - Experiments: ', function() {
    describe('Delete Experiment - simple case: ', function () {
        it('does not delete an experiment with a published dataset', function* (){
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            let idList = [];
            for (let i = 0; i < datasetList.length; i++){
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

            // delete experiment - fails
            results = yield experimentDelete.deleteExperiment(project_id,experiment_id, {deleteProcesses: true, dryRun: false});
            assert.isOk(results);
            assert.isOk(results.error);

        });
        it('deletes all datasets, processes, samples, tasks, and links to files', function* (){
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            yield testBestMearureHistroy({assertExists: true});

            yield testProcessesSamples({assertExists: true});

            // delete experiment
            let results = yield experimentDelete
                .deleteExperiment(project_id,experiment_id, {deleteProcesses: true,dryRun: false});
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.datasets);
            assert.equal(results.val.datasets.length,2);
            assert.isOk(results.val.best_measure_history);
            assert.equal(results.val.best_measure_history.length,1);
            assert.isOk(results.val.processes);
            assert.equal(results.val.processes.length,5);
            assert.isOk(results.val.samples);
            assert.equal(results.val.samples.length,8);

            yield testDatasets({assertExists: false});

            yield testBestMearureHistroy({assertExists: false});

            yield testProcessesSamples({assertExists: false});

        });
    });
});

function* testDatasets(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 2;
    }

    let idList = [];
    for (let i = 0; i < datasetList.length; i++){
        idList.push(datasetList[i].id);
    }

    let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = check.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length,count);

    check = yield r.table('dataset2process').getAll(r.args([...idList]),{index:'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length,count);

    check = yield r.table('experiment2dataset').getAll(r.args([...idList]),{index:'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length,count);
}

function* testBestMearureHistroy(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 1;
    }

    let idList = yield r.table('experiment2sample')
        .getAll(experiment.id,{index:'experiment_id'})
        .eqJoin('sample_id',r.table('samples')).zip()
        .eqJoin('sample_id',r.table('sample2propertyset'),{index: 'sample_id'}).zip()
        .eqJoin('property_set_id',r.table('propertysets')).zip()
        .eqJoin('property_set_id',r.table('propertyset2property'),{index: 'property_set_id'}).zip()
        .eqJoin('property_id',r.table('properties')).zip()
        .eqJoin('property_id',r.table('best_measure_history'),{index: 'property_id'}).zip()
        .getField('property_id');

    assert.isOk(idList);
    assert.equal(idList.length,count);
}

function* testProcessesSamples(options) {

    let processCount = 0;
    let sampleCount = 0;
    if (options && options.assertExists) {
        processCount = 5;
        sampleCount = 8;
    }
    let sampleList = yield r.db('materialscommons').table('experiment2sample')
        .getAll(experiment.id,{index:'experiment_id'})
        .eqJoin('sample_id',r.db('materialscommons').table('samples')).zip()
        .getField('sample_id');
    assert.isOk(sampleList);
    assert.equal(sampleList.length,sampleCount);

    let simple = true;
    let results = yield experiments.getProcessesForExperiment(experiment.id, simple);
    assert.isOk(results);
    assert.isOk(results.val);
    let procList = results.val;
    assert.equal(procList.length, processCount);

}