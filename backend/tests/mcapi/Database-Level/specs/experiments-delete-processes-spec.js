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

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let process_list = null;
let sample_list = null;
let file_list = null;

before(function*() {

    this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId,user.id);

    let valOrError = yield buildDemoProject.findOrBuildAllParts(user,demoProjectConf.datapathPrefix);
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
    assert.equal(updated_project.id,project_id);
    project = updated_project;

    let processesToAdd = [
        {id: process_list[0].id}
    ];

    let processesToDelete = [];

    let datasetArgs = {
        title:"Test Dataset1",
        description:"Dataset for testing"
    };

    let result = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    let dataset = result.val;
    assert.isOk(dataset);

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete);

    datasetArgs = {
        title:"Test Dataset2",
        description:"Dataset for testing"
    };

    result = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    dataset = result.val;
    assert.isOk(dataset);

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete)

    results = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
    let dataset_list = results.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length,2);

});

describe('Feature - Experiments: ', function() {
    describe('Delete Experiment - in parts: ', function () {
        it('deletes datasets and deletes all processes and samples', function* (){
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            // Note: create fake sample that is not part of a process for testing
            let rv = yield r.table('samples').insert({'name':'fake sample', 'otype':'sample', 'owner':'noone'})
            let key = rv.generated_keys[0];
            yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment_id});

            let results = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
            let dataset_list = results.val;
            assert.isOk(dataset_list);
            assert.equal(dataset_list.length,2);

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

            // Note: delete process also deletes all samples associated with the processes ...

            results = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
            dataset_list = results.val;
            assert.isOk(dataset_list);
            assert.equal(dataset_list.length,0);

            for (let i = process_list.length; i > 0; i--) {
                // delete leaf-nodes first!
                let process = process_list[i-1];
                yield processes.deleteProcess(project.id,process.id);
            }

            let simple = true;
            results = yield experiments.getProcessesForExperiment(experiment_id, simple);
            let proc_list = results.val;
            assert.isOk(proc_list);
            assert.equal(proc_list.length,0);

            // ... but, in rare cases, there my be samples in the experiment that are in no process

            let sampleList = yield r.table('experiment2sample')
                .getAll(experiment_id,{index:'experiment_id'})
                .eqJoin('sample_id',r.table('samples')).zip()
                .getField('sample_id');

            rv = yield r.table('samples').getAll(r.args([...sampleList])).delete();

            assert.equal(rv.deleted, 1);

            // and the sample entries for the experiment are left in experiment2sample

            rv = yield r.table('experiment2sample')
                .getAll(experiment_id,{index:'experiment_id'}).delete();

            assert.equal(rv.deleted, 8);

        });
    });
});
