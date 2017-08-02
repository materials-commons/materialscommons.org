'use strict';

const it = require('mocha').it;
require('co-mocha');
const _ = require('lodash');
const chai = require('chai');
const assert = chai.assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";

const dbModelUsers = require(backend_base + '/users');

const testHelpers = require('./test-helpers');

let userId = "test@test.mc";
let user = null;

let project = null;
let experiment_number = 0;

let random_project_name = function(){
    let number = Math.floor(Math.random()*10000);
    return "Project For Process Testing - " + number;
};

before(function*() {
    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);
    let ret = yield testHelpers.createProject(random_project_name(),user);
    assert.isOk(ret);
    assert.isOk(ret.val);
    project = ret.val;
    assert.equal(project.owner,user.id);
    console.log("Test project name: ",project.name);
});

describe('Feature - Processes: ', function() {
    describe('Function level', function () {
        it('creates a process', function*(){
            let ret = yield testHelpers.createExperiment(project,"Create Process Experiment");
            assert.isOk(ret);
            assert.isOk(ret.val);
            let experiment = ret.val;
            assert.isOk(experiment);
            assert.equal(experiment.owner,user.id);
            ret = yield testHelpers.createProcess(
                project, experiment, "Test Create Sample Process",'global_Create Samples');
            assert.isOk(ret);
            assert.isOk(ret.val);
            let process = ret.val;
            assert.isOk(process);
            assert.equal(process.owner,user.id);
        });
        it('creates two processes linked by sample ', function*(){
            let ret = yield testHelpers.createExperiment(project,"Two Processes Experiment");
            assert.isOk(ret);
            assert.isOk(ret.val);
            let experiment = ret.val;
            assert.isOk(experiment);
            assert.equal(experiment.owner,user.id);
            ret = yield testHelpers.createProcess(
                project, experiment, "Test Create Sample Process",'global_Create Samples');
            assert.isOk(ret);
            assert.isOk(ret.val);
            let create_sample_process = ret.val;
            assert.isOk(create_sample_process);
            assert.equal(create_sample_process.owner,user.id);
            ret = yield testHelpers.createSamples(
                project, experiment, create_sample_process, ['Test Sample']
            );
            assert.isOk(ret);
            assert.isOk(ret.val);
            assert.isOk(ret.val.samples);
            assert.equal(ret.val.samples.length,1);
            let sample = samples[0];
            console.log(sample);
        });

    });
});
