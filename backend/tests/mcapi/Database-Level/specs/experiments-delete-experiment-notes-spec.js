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

    let projectId = project.id;
    let experimentId = experiment.id;

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
    assert.equal(updated_project.id,projectId);
    project = updated_project;

    for (let i = 0; i < process_list.length; i++) {
        let process = process_list[i];
        yield processes.deleteProcess(project.id,process.id);
    }

    let simple = true;
    results = yield experiments.getProcessesForExperiment(experimentId, simple);
    assert.equal(results.val.length,0);

    let rv = yield r.table('experiment2sample')
        .getAll(experimentId,{index:'experiment_id'}).delete();

    assert.equal(rv.deleted, 7);

    yield setUpFakeExperimentNoteData(experimentId);
    yield setUpAdditionalExperimentTaskData(experimentId);

    console.log(project.name);
    console.log(experiment.name);
    console.log(experimentId);
});

describe('Feature - Experiments: ', function() {
    describe('Delete Experiment - basic parts: ', function () {
        it('deletes experiment part: experiment-notes', function* (){
            // ---- experimentnote ----
            // experiment2experimentnote
            // experimentnotes

            let projectId = project.id;
            assert.isOk(projectId);
            let experimentId = experiment.id;
            assert.isOk(experimentId);

            let idList = yield r.table('experiment2experimentnote')
                .getAll(experimentId,{index:'experiment_id'})
                .eqJoin('experiment_note_id',r.table('experimentnotes'))
                .zip().getField('experiment_note_id');

            let delete_msg = yield r.table('experimentnotes').getAll(r.args([...idList])).delete();
            assert.equal(delete_msg.deleted, 1);

            delete_msg = yield r.table('experiment2experimentnote')
                .getAll(experimentId,{index:'experiment_id'}).delete();
            assert.equal(delete_msg.deleted, 1);
        });
        it('deletes experiment part: experiment-tasks', function* (){
            let projectId = project.id;
            assert.isOk(projectId);
            let experimentId = experiment.id;
            assert.isOk(experimentId);

            // get taskId and processId
            let idList = yield r.table('experiment2experimenttask')
                .getAll(experimentId,{index:'experiment_id'})
                .eqJoin('experiment_task_id',r.table('experimenttasks'))
                .zip().getField('experiment_task_id');
            assert.isOk(idList);
            assert.equal(idList.length,1);
            let taskId = idList[0];
            assert.isOk(taskId);

            let task = yield r.table('experimenttasks').get(taskId);
            assert.isOk(task);
            assert.isOk(task.process_id);
            let processId = task.process_id;

            console.log('taskId: ',taskId);
            console.log('processId: ',processId);

            // experiment2experimenttask
            // experimenttask2process
            // experimenttasks
            // processes

            idList = yield r.table('experimenttask2process')
                .getAll(taskId,{index:'experiment_task_id'})
                .eqJoin('process_id',r.table('processes'))
                .zip().getField('process_id');
            delete_msg = yield r.table('processes').getAll(r.args([...idList])).delete();
            assert.equal(delete_msg.deleted, 1);

            delete_msg = yield r.table('experimenttask2process')
                .getAll(taskId,{index:'experiment_task_id'}).delete();
            assert.equal(delete_msg.deleted, 1);

            idList = yield r.table('experiment2experimenttask')
                .getAll(experimentId,{index:'experiment_id'})
                .eqJoin('experiment_task_id',r.table('experimenttasks'))
                .zip().getField('experiment_task_id');
            let delete_msg = yield r.table('experimenttasks').getAll(r.args([...idList])).delete();
            assert.equal(delete_msg.deleted, 1);

            delete_msg = yield r.table('experiment2experimenttask')
                .getAll(experimentId,{index:'experiment_id'}).delete();
            assert.equal(delete_msg.deleted, 1);

        });
        it('deletes links between files and experiment', function* (){
            let experimentId = experiment.id;
            assert.isOk(experimentId);

            let delete_msg = yield r.table('experiment2datafile')
                .getAll(experimentId,{index:'experiment_id'}).delete();
            assert.equal(delete_msg.deleted, 16);
        });
    });
});

let setUpFakeExperimentNoteData = function* (experimentId) {
    // ---- experimentnote ----
    // experiment2experimentnote
    // experimentnotes

    // Note, the demo project (used as base for this test) had no items in experimentnotes
    // Inserting one here, as base for test
    let fakeNote = {
        name: "Test Note",
        note: "Fake note for testing",
        otype:'experimentnote',
        owner: userId
    };
    let insert_msg = yield r.table('experimentnotes').insert(fakeNote);
    let key = insert_msg.generated_keys[0];
    yield r.table('experiment2experimentnote')
        .insert({experiment_note_id: key, experiment_id: experimentId});
};

let setUpAdditionalExperimentTaskData = function* (experimentId) {
    // ---- experimenttask ----
    // experiment2experimenttask
    // experimenttask2process
    // experimenttasks
    // processes

    let fakeProcess = {
        otype:  "process" ,
        does_transform: true ,
        name:  "Test Process" ,
        owner: userId,
        template_id:  "global_SEM" ,
        template_name:  "SEM"
    };

    let insertMsg = yield r.table('processes').insert(fakeProcess);
    assert.isOk(insertMsg.generated_keys);
    assert.equal(insertMsg.generated_keys.length,1);
    let processId = insertMsg.generated_keys[0];

    let idList = yield r.table('experiment2experimenttask')
         .getAll(experimentId,{index:'experiment_id'})
         .eqJoin('experiment_task_id',r.table('experimenttasks'))
         .zip().getField('experiment_task_id');
    assert.isOk(idList);
    assert.equal(idList.length, 1);
    let taskId = idList[0];

    let updateMsg = yield r.table('experimenttasks').get(taskId).update({process_id: processId});
    assert.isOk(updateMsg);
    assert.isOk(updateMsg.replaced);
    assert.equal(updateMsg.replaced,1);

    insertMsg = yield r.table('experimenttask2process')
        .insert({experiment_task_id: taskId, process_id: processId});
    assert.isOk(insertMsg.generated_keys);
    assert.equal(insertMsg.generated_keys.length,1);
};