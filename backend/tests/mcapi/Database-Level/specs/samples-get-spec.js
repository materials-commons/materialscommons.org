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
const samples = require(backend_base + '/servers/mcapi/db/model/samples');

const testHelpers = require('./test-helpers');

const baseProjectName = "Test samples - ";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return baseProjectName + number;
};

let userId = 'test@test.mc';
let sample1 = null;
let sample2 = null;
let project = null;
let experiment = null;
let createSampleProcess = null;
let transformationProcess1 = null;
let transformationProcess2 = null;

before(function* () {
    console.log('before samples-get-spec.js');
    this.timeout(80000); // setup may take up to 8 seconds
    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user);

    // create a project
    console.log('1');
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
    console.log('2');
    let experimentName = "Experment For Test";
    results = yield testHelpers.createExperiment(project, experimentName);
    assert.isOk(results.val);
    experiment = results.val;
    assert.equal(experiment.otype, 'experiment');
    assert.equal(experiment.name, experimentName);
    assert.equal(experiment.owner, userId);

    // add a create sample process to it
    console.log('3');
    let processName = "Create Sample - test process";
    let processTemplateId = "global_Create Samples";
    results = yield testHelpers.createProcess(project, experiment, processName, processTemplateId);
    assert.isOk(results.val);
    createSampleProcess = results.val;
    assert.equal(createSampleProcess.otype, 'process');
    assert.equal(createSampleProcess.name, processName);
    assert.equal(createSampleProcess.template_id, processTemplateId);
    assert.equal(createSampleProcess.owner, userId);
    assert.equal(createSampleProcess.process_type, 'create');

    // create a sample set
    console.log('4');
    let sampleName1 = "Sample1 For Test";
    let sampleName2 = "Sample2 For Test";
    results = yield testHelpers.createSamples(project, experiment, createSampleProcess, [sampleName1, sampleName2]);
    assert.isOk(results.val);
    assert.isOk(results.val.samples);
    let samples = results.val.samples;
    assert.isOk(samples);
    assert.equal(samples.length, 2);
    sample1 = samples[0];
    assert.isOk(sample1);
    assert.equal(sample1.otype, 'sample');
    assert.equal(sample1.name, sampleName1);
    sample2 = samples[1];
    assert.isOk(sample2);
    assert.equal(sample2.otype, 'sample');
    assert.equal(sample2.name, sampleName2);

    // add input samples to a create samples process
    processName = 'Create Samples with Input';
    processTemplateId = 'global_Create Samples';
    results = yield testHelpers.createProcess(project, experiment, processName, processTemplateId);
    assert.isOk(results.val);
    console.log('Create Samples with Input before adding samples', results.val);
    let createProcess1 = results.val;
    assert.equal(createProcess1.otype, 'process');
    assert.equal(createProcess1.name, processName);
    assert.equal(createProcess1.template_id, processTemplateId);
    assert.equal(createProcess1.owner, userId);
    results = yield testHelpers.addSamplesToProcess(project, experiment, createProcess1, [sample1]);
    assert.isOk(results.val);

    // add a transformation process
    processName = "Etching1 - test process";
    processTemplateId = "global_Etching";
    results = yield testHelpers.createProcess(project, experiment, processName, processTemplateId);
    assert.isOk(results.val);
    transformationProcess1 = results.val;
    assert.equal(transformationProcess1.otype, 'process');
    assert.equal(transformationProcess1.name, processName);
    assert.equal(transformationProcess1.template_id, processTemplateId);
    assert.equal(transformationProcess1.owner, userId);

    // add a sample to that process
    results = yield testHelpers.addSamplesToProcess(project, experiment, transformationProcess1, [sample1]);
    assert.isOk(results.val);
    let checkProcess = results.val;
    assert.equal(checkProcess.otype, 'process');
    assert.equal(checkProcess.name, processName);
    assert.equal(checkProcess.template_id, processTemplateId);
    assert.equal(checkProcess.owner, userId);
    assert.equal(checkProcess.process_type, 'transform');
    assert.equal(checkProcess.input_samples[0].id, sample1.id);
    assert.equal(checkProcess.output_samples[0].id, sample1.id);

    // add a another transformation process
    processName = "Etching2 - test process";
    processTemplateId = "global_Etching";
    results = yield testHelpers.createProcess(project, experiment, processName, processTemplateId);
    assert.isOk(results.val);
    transformationProcess2 = results.val;
    assert.equal(transformationProcess2.otype, 'process');
    assert.equal(transformationProcess2.name, processName);
    assert.equal(transformationProcess2.template_id, processTemplateId);
    assert.equal(transformationProcess2.owner, userId);

    // add the other sample to that process
    results = yield testHelpers.addSamplesToProcess(project, experiment, transformationProcess2, [sample2]);
    assert.isOk(results.val);
    checkProcess = results.val;
    assert.equal(checkProcess.otype, 'process');
    assert.equal(checkProcess.name, processName);
    assert.equal(checkProcess.template_id, processTemplateId);
    assert.equal(checkProcess.owner, userId);
    assert.equal(checkProcess.process_type, 'transform');
    assert.equal(checkProcess.input_samples[0].id, sample2.id);
    assert.equal(checkProcess.output_samples[0].id, sample2.id);
    console.log('done before samples-get-spec.js');
});

describe('Feature - Samples: ', function () {
    describe('Get Samples', function () {
        it('get samples by id', function* () {
            let results = yield samples.getSample(sample1.id);
            assert.isOk(results.val);
            let sample = results.val;
            assert.equal(sample.otype, 'sample');
            assert.equal(sample.name, sample1.name);
            let experiments = sample.experiments;
            assert.equal(experiments.length, 1);
            assert.equal(experiments[0].id, experiment.id);
            let processes = sample.processes;
            assert.equal(processes.length, 3);
            let checks = [
                {name: createSampleProcess.name, direction: 'out'},
                {name: transformationProcess1.name, direction: 'in'},
                {name: transformationProcess1.name, direction: 'out'}
            ];
            for (let c = 0; c < checks.length; c++) {
                let name = checks[c].name;
                let direction = checks[c].direction;
                let found = false;
                for (let i = 0; i < processes.length; i++) {
                    if (name === processes[i].name && direction === processes[i].direction) {
                        found = true;
                    }
                }
                assert(found, `Missing process for sample ${sample1.name}: expected name = '${name}' with direction '${direction}'`)
            }
        });

        it('gets all samples for experiment', function* () {
            let results = yield samples.getAllSamplesForExperiment(experiment.id);
            assert.isOk(results.val);
            let sampleList = results.val;
            assert.equal(sampleList.length, 2);
            let testTable = {};
            for (let i = 0; i < sampleList.length; i++) {
                testTable[sampleList[i].id] = sampleList[i];
            }
            assert.isOk(testTable[sample1.id]);
            assert.equal(testTable[sample1.id].name, sample1.name);
            assert.isOk(testTable[sample2.id]);
            assert.equal(testTable[sample2.id].name, sample2.name);
        });
        it('gets all samples for project', function* () {
            let results = yield samples.getAllSamplesForProject(project.id);
            assert.isOk(results.val);
            let sampleList = results.val;
            assert.equal(sampleList.length, 2);
            let testTable = {};
            for (let i = 0; i < sampleList.length; i++) {
                testTable[sampleList[i].id] = sampleList[i];
            }
            assert.isOk(testTable[sample1.id]);
            assert.equal(testTable[sample1.id].name, sample1.name);
            assert.isOk(testTable[sample2.id]);
            assert.equal(testTable[sample2.id].name, sample2.name);
        });
    });
});
