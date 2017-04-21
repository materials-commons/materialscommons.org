const r = require('../r');
const db = require('./db');

const experiments = require('./experiments');
const experimentDelete = require('./experiment-delete');
const projects = require('./projects');
const files = require('./files');

function* deleteProject(projectId, options) {

    let dryRun = !!(options && options.dryRun);

    let errorAddIn =
        " WARNING. The project may have been partially deleted - project state unknown.";

    console.log("dryRun: ",dryRun);

    let hasPublishedDatasets = yield testForPublishedDatasets(projectId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let results = yield projects.getProject(projectId);

    let project = null;
    let datasets = [];
    let samples = [];

    if (results.val) {
        project = results.val;
        datasets = project.datasets;
        samples = project.samples;
    } else {
        let error = results.error;
        error += errorAddIn;
        return {
            error: error
        }
    }

    let fileIdList = yield r.table("project2datafile")
        .getAll(projectId,{index: "project_id"}).getField('datafile_id');

    results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    let deletedExperiments = [];
    for (let i = 0; i < experimentList.length; i++) {
        let experiment = experimentList[i];
        let results = yield experimentDelete
            .deleteExperiment(projectId, experiment.id, {deleteProcesses: true, dryRun: dryRun});
        if (results.val) {
            let tally = results.val;
            deletedExperiments.push(
                {
                    experiment: experiment,
                    deleted: tally
                }
            );
        } else {
            let error = results.error;
            error += errorAddIn;
            return {
                error: error
            }
        }
    }

    let ret = {
        val: {
            project: project,
            experiments: deletedExperiments,
            datasets: datasets,
            files: fileIdList,
            samples: samples
        }
    };

    if (!dryRun) {
        yield deleteSamples(samples);
        yield deleteFiles(fileIdList)
//        yield deleteLinks(projectId);
        yield deteleProjectRecord(projectId);
    }

    return ret;
}

module.exports = {
    deleteProject
};


function* testForPublishedDatasets(projectId){

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    for (let i = 0; i < experimentList.length; i++) {
        let datasetList = experimentList[i].datasets;
        for (let j = 0; j < datasetList.length; j++) {
            let dataset = datasetList[j];
            if (datasetList[j].published) {
                return true;
            }
        }
    }
    return false;
}

function* deleteSamples(samples) {
    console.log("Number of samples: " + samples.length);
}

function* deleteFiles(fileIdList) {
    for (let i = 0; i < fileIdList.length; i++) {
        yield files.deleteFile(fileIdList[i]);
    }
}

function* deleteLinks(projectId) {
    let tables = [
        'project2datadir' ,
        'project2datafile' ,
        'project2experiment' ,
        'project2process' ,
        'project2sample'
    ];

    for (let i = 0; i < tables.length; i++) {
        yield r.table(tables[i]).getAll(projectId, {index: 'project_id'}).delete();
    }
}

function* deteleProjectRecord(projectId) {
    console.log("Delete project record:", projectId);
}