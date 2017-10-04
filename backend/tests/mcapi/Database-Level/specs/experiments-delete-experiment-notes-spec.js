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

const testHelpers = require('./test-helpers');

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

// this appears to be relivent and is failing
//    for (let i = process_list.length; i > 0; i--) {
//        // delete leaf-nodes first!
//        let process = process_list[i - 1];
//        yield processes.deleteProcess(project.id, process.id);
//    }
//
//    let simple = true;
//    results = yield experiments.getProcessesForExperiment(experimentId, simple);
//    assert.equal(results.val.length,0);
//
//    let rv = yield r.table('experiment2sample')
//        .getAll(experimentId,{index:'experiment_id'}).delete();
//
//    assert.equal(rv.deleted, 7);
//
//    yield testHelpers.setUpFakeExperimentNoteData(experimentId,userId);
//    yield testHelpers.setUpAdditionalExperimentTaskData(experimentId,userId);

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

            // experiment2experimenttask
            // experimenttask2process
            // experimenttasks
            // processes

            idList = yield r.table('experimenttask2process')
                .getAll(taskId,{index:'experiment_task_id'})
                .eqJoin('process_id',r.table('processes'))
                .zip().getField('process_id');
            let delete_msg = yield r.table('processes').getAll(r.args([...idList])).delete();
            assert.equal(delete_msg.deleted, 1);

            delete_msg = yield r.table('experimenttask2process')
                .getAll(taskId,{index:'experiment_task_id'}).delete();
            assert.equal(delete_msg.deleted, 1);

            idList = yield r.table('experiment2experimenttask')
                .getAll(experimentId,{index:'experiment_id'})
                .eqJoin('experiment_task_id',r.table('experimenttasks'))
                .zip().getField('experiment_task_id');
            delete_msg = yield r.table('experimenttasks').getAll(r.args([...idList])).delete();
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
