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
const samples = require(backend_base + '/servers/mcapi/db/model/samples');

const testHelpers = require('./test-helpers');

const baseProjectName = "Test samples - ";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return baseProjectName + number;
};

let userId = 'test@test.mc';

let createSampleProcess = null;
let project = null;

before(function* () {
    console.log('before samples-create-spec.js');
    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user);

    // create a project
    let projectName = random_name();
    let results = yield testHelpers.createProject(projectName, user);
    assert.isOk(results.val);
    project = results.val;
    assert.equal(project.otype, "project");
    assert.equal(project.name, projectName);
    assert.equal(project.owner, user.id);
    assert.equal(project.owner, userId);
    assert.equal(project.users.length, 1);
    assert.equal(project.users[0].user_id, userId);

    // create an experiment
    let experimentName = "Experment For Test";
    results = yield testHelpers.createExperiment(project, experimentName);
    assert.isOk(results.val);
    let experiment = results.val;
    assert.equal(experiment.otype, 'experiment');
    assert.equal(experiment.name, experimentName);
    assert.equal(experiment.owner, userId);

    // add a create sample process to it
    let processName = "Create Sample - test process";
    let processTemplateId = "global_Create Samples";
    results = yield testHelpers.createProcess(project, experiment, processName, processTemplateId);
    assert.isOk(results.val);
    createSampleProcess = results.val;
    assert.equal(createSampleProcess.otype, 'process');
    assert.equal(createSampleProcess.name, processName);
    assert.equal(createSampleProcess.template_id, processTemplateId);
    assert.equal(createSampleProcess.owner, userId);
    console.log('done before samples-create-spec.js');
});

describe('Feature - Samples: ', function () {
    describe('Create Sample', function () {
        it('create a sample set', function* () {
            let sampleName1 = "Sample1 For Test";
            let sampleName2 = "Sample2 For Test";
            let sampleNameList = [sampleName1, sampleName2];
            let sampleNameArgs = [];
            sampleNameList.forEach((name) => {
                sampleNameArgs.push({name: name});
            });
            let results = yield samples.createSamples(project.id, createSampleProcess.id, sampleNameArgs, project.owner);
            assert.isOk(results.val);
            assert.isOk(results.val.samples);
            let sampleList = results.val.samples;
            assert.isOk(sampleList);
            assert.equal(sampleList.length, 2);
            let sample1 = sampleList[0];
            assert.isOk(sample1);
            assert.equal(sample1.otype, 'sample');
            assert.equal(sample1.name, sampleName1);
            let sample2 = sampleList[1];
            assert.isOk(sample2);
            assert.equal(sample2.otype, 'sample');
            assert.equal(sample2.name, sampleName2);

        });
    });
});
