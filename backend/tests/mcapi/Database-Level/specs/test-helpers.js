'use strict';
require('mocha');
require('co-mocha');

const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";

const projects = require(backend_base + '/projects');
const directories = require(backend_base + '/directories');
const experiments = require(backend_base + '/experiments');
const processes = require(backend_base + '/processes');
const samples = require(backend_base + '/samples');

function* createProject(projectName,user){
    let attrs = {
        name: projectName,
        description: "This is a test project for automated testing."
    };
    let ret = yield projects.createProject(user,attrs);
    // ret == val.ok_val or error.error
    return ret;
}

function* createExperiment(project,experimentName) {
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

function* createSamples(project, experiment, process, sampleNameList) {
    let sampleNameArgs = [];
    sampleNameList.forEach((name) => {
        sampleNameArgs.push({name: name});
    });
    let ret = yield samples.createSamples(project.id, process.id, sampleNameArgs, project.owner);
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

module.exports = {
    createProject,
    createExperiment,
    createProcess,
    createSamples,
    addSamplesToProcess
};
