'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
require('mocha');
require('co-mocha');
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);
const mkdirpAsync = promise.promisify(require('mkdirp'));

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const lib_base = '../../../../servers/lib';
const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";
const build_project_base = mcapi_base + "/build-demo";

const fileUtils = require(lib_base + "/create-file-utils");

const projects = require(backend_base + '/projects');
const directories = require(backend_base + '/directories');
const experiments = require(backend_base + '/experiments');
const processes = require(backend_base + '/processes');
const samples = require(backend_base + '/samples');
const experimentDatasets = require(backend_base + '/experiment-datasets');

const demoProjectHelper = require(build_project_base + '/build-demo-project-helper');
const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
// correction needed bacause package.json was moved to backend - Terry Weymouth - 14AUG2017
demoProjectConf.datapathPrefix = path.resolve('./') + '/';
const demoProjectBuild = require(build_project_base + '/build-demo-project');

const base_project_name = "TestProject-";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let random_file_name = function(prefix){
    let number = Math.floor(Math.random()*10000);
    let str = prefix + "-file-" + number + ".txt";
    str = str.replace(/ /g,'');
    return str;
};

function* createDemoTestProject(user) {

    let valOrError = yield demoProjectBuild.findOrBuildAllParts(user,demoProjectConf.datapathPrefix);
    if (valOrError.val) {
        let results = valOrError.val;
        let project = results.project;
        let experiment = results.experiment;
        let processList = results.processes;
        let sampleList = results.samples;
        let fileList = results.files;

        let name = random_name();
        let description = "Changed the name of the demo project to " + name;
        let updateData = {
            name: name,
            description: description
        };
        let updated_project = yield projects.update(project.id, updateData);
        project = updated_project;
        valOrError.val = {
            project: project,
            experiment: experiment,
            processList: processList,
            sampleList: sampleList,
            fileList: fileList
        }
    }
    return valOrError;
}

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

function* createFileFromDemoFileSet(project,demoFileIndex,user) {
    let tempDir = os.tmpdir();
    let top_directory = yield directories.get(project.id, 'top');
    let checksumFilenameAndMimetype = demoProjectHelper.filesDescriptions()[demoFileIndex];
    let expectedChecksum = checksumFilenameAndMimetype[0];
    let filename = checksumFilenameAndMimetype[1];
    let mimetype = checksumFilenameAndMimetype[2];
    let filepath = demoProjectConf.datapathPrefix + `${demoProjectConf.datapath}/${filename}`;
    let checksum = yield md5File(filepath);
    if (expectedChecksum == checksum) {
        let stats = fs.statSync(filepath);
        let fileSizeInBytes = stats.size;
        let source = yield copyOne(filepath, tempDir);
        filepath = source.path;
        let args = {
            name: filename,
            checksum: checksum,
            mediatype: fileUtils.mediaTypeDescriptionsFromMime(mimetype),
            filesize: fileSizeInBytes,
            filepath: filepath
        };
        let file = yield directories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
        return file;
    } else {
        return null;
    }
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

let createDatasetList = function* (experiment, processList, userId) {
    let processesToAdd = [
        {id: processList[0].id}
    ];

    let processesToDelete = [];

    let datasetArgs = {
        title:"Test Dataset1",
        description:"Dataset for testing"
    };

    let results = yield experimentDatasets.createDatasetForExperiment(experiment.id, userId, datasetArgs);
    let dataset = results.val;

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete);

    datasetArgs = {
        title:"Test Dataset2",
        description:"Dataset for testing"
    };

    results = yield experimentDatasets.createDatasetForExperiment(experiment.id, userId, datasetArgs);
    dataset = results.val;

    yield experimentDatasets.updateProcessesInDataset(dataset.id, processesToAdd, processesToDelete);

    results = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = results.val;
    return dataset_list;
};

let setUpFakeExperimentNoteData = function* (experimentId,userId) {
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
    return yield r.table('experimentnotes').get(key);
};

let setUpAdditionalExperimentTaskData = function* (experimentId,userId) {
    // ---- experimenttask ----
    // experiment2experimenttask
    // experimenttask2process
    // experimenttasks
    // processes

    let fakeProcess = {
        otype:  "process" ,
        does_transform: false ,
        name:  "Test Process" ,
        owner: userId,
        template_id:  "global_As Measured" ,
        template_name:  "As Measured"
    };

    let insertMsg = yield r.table('processes').insert(fakeProcess);
    let processId = insertMsg.generated_keys[0];

    let idList = yield r.table('experiment2experimenttask')
        .getAll(experimentId,{index:'experiment_id'})
        .eqJoin('experiment_task_id',r.table('experimenttasks'))
        .zip().getField('experiment_task_id');
    let taskId = idList[0];

    let updateMsg = yield r.table('experimenttasks').get(taskId).update({process_id: processId});
    insertMsg = yield r.table('experimenttask2process')
        .insert({experiment_task_id: taskId, process_id: processId});

    return yield r.table('experimenttasks').get(taskId);
};

module.exports = {
    createDemoTestProject,
    createProject,
    createExperiment,
    createProcess,
    createSamples,
    createDatasetList,
    createFileFromDemoFileSet,
    addSamplesToProcess,
    setUpFakeExperimentNoteData,
    setUpAdditionalExperimentTaskData,
};
