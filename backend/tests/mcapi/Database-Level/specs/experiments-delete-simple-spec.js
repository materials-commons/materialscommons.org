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

            // test that structures exist - datasets
            let idList = [];
            for (let i = 0; i < datasetList.length; i++){
                idList.push(datasetList[i].id);
            }

            let check = yield r.table('experiment2dataset').getAll(r.args([...idList]),{index:'dataset_id'});
            assert.isOk(check);
            assert.equal(check.length,2);

            // publish one of the datasets
            let datasetId = idList[0];
            let results = yield experimentDatasets.publishDataset(datasetId);
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.published);
            assert(results.val.published);

            // delete experiment - fails
            results = yield experimentDelete.deleteExperiment(experiment_id, {deleteProcesses: true,dryRun: false});
            assert.isOk(results);
            assert.isOk(results.error);

        });
        it('deletes all datasets, processes, samples, tasks, and links to files', function* (){
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            // test that structures exist - datasets
            let idList = [];
            for (let i = 0; i < datasetList.length; i++){
                idList.push(datasetList[i].id);
            }

            let check = yield r.table('dataset2process').getAll(r.args([...idList]),{index:'dataset_id'});
            assert.isOk(check);
            assert.equal(check.length,2);

            check = yield r.table('experiment2dataset').getAll(r.args([...idList]),{index:'dataset_id'});
            assert.isOk(check);
            assert.equal(check.length,2);

            // delete experiment
            let results = yield experimentDelete.deleteExperiment(experiment_id, {deleteProcesses: true,dryRun: false});
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.datasets);
            assert.equal(results.val.datasets.length,2);

            // test that structures are deleted - datasets
            check = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
            let dataset_list = check.val;
            assert.isOk(dataset_list);
            assert.equal(dataset_list.length,0);

            check = yield r.table('dataset2process').getAll(r.args([...idList]),{index:'dataset_id'});
            assert.isOk(check);
            assert.equal(check.length,0);

            check = yield r.table('experiment2dataset').getAll(r.args([...idList]),{index:'dataset_id'});
            assert.isOk(check);
            assert.equal(check.length,0);

        });
    });
});
