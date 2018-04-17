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
let dataset_list = null;

before(function*() {
    console.log('before experiments-delete-complex-delete-processes-spec.js');
    this.timeout(80000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId,user.id);

//    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, demoProjectConf.datapathPrefix);
    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, process.cwd()+'/');
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
    dataset_list = results.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length,2);

    // Note: create fake sample that is not part of a process for testing
    result = yield r.table('samples').insert({'name':'fake sample', 'otype':'sample', 'owner':'noone'})
    let key = result.generated_keys[0];
    yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment_id});

    // create new experiment
    results = yield createAdditionalExperiment(project,"Experment For Test");
    assert.isOk(results.val);
    let extraExperiment = results.val;
    assert.equal(extraExperiment.otype,'experiment');

    // add a process to it
    results = yield createProcess(project,extraExperiment,"Etching - test process","global_Etching");
    assert.isOk(results.val);
    let extraProcess = results.val;
    assert.equal(extraProcess.otype,'process');

    // reuse an existing sample for that process
    let sampleToUse = sample_list[1];
    results = yield addSamplesToProcess(project,extraExperiment,extraProcess,[sampleToUse]);
    console.log('done before experiments-delete-complex-delete-processes-spec.js');
});

describe('Feature - Experiments: ', function() {
    describe('Delete Experiment - complex case: ', function () {
        it('deletes all datasets, processes, samples, tasks, and links to files', function* (){
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            // test that structures exist

            // experiments.delete(experiment_id, {deleteProcesses: true});

            // test that structures are deleted

        });
    });
});

function* createAdditionalExperiment(project,experimentName) {
    let experimentDescription = "Test experiment";
    let args = {
        project_id: project.id,
        name: experimentName,
        description: experimentDescription
    };
    let ret = yield experiments.create(args, project.owner);
    // ret == val.ok_val or error.error
    return ret;
}

function* createProcess(project, experiment, processName, templateId) {
    let simple = true;
    let ret = yield experiments.addProcessFromTemplate(project.id, experiment.id, templateId, project.owner);
    if (!ret.error) {
        let process = ret.val;
        let args = {name: processName, files: [], properties: [], samples: []};
        ret = yield processes.updateProcess(process.id, args);
    }
    // ret == val.ok_val or error.error
    return ret;
}

function* addSamplesToProcess(project, experiment, process, sampleList) {
    let resultsingSamples = [];
    let ret = yield processes.getProcess(process.id);
    if (!ret.error) {
        process = ret.val;
        let samplesData = [];
        sampleList.forEach((sample) => {
            samplesData.push({
                command: 'add',
                id: sample.id,
                property_set_id: sample.property_set_id
            })
        });
        let args = {
            template_id: process.template_id,
            process_id: process.id,
            samples: samplesData
        };
        let properties = [];
        let files = [];
        let samples = args.samples;
        ret = yield experiments.updateProcess(experiment.id, process.id,
            properties, files, samples);
    }
    // ret == val.ok_val or error.error
    return ret;
}
