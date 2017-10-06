const r = require('../r');

const experiments = require('./experiments');
const experimentDelete = require('./experiment-delete');
const projects = require('./projects');
const files = require('./files');

function* deleteProject(projectId, options) {

    let dryRun = !!(options && options.dryRun);

    let errorAddIn =
        " WARNING. The project may have been partially deleted - project state unknown.";

    let hasPublishedDatasets = yield testForPublishedDatasets(projectId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete a project that has any experiment with a published datasets"}
    }

    let hasDOIAssigned = yield testForDOIAssigned(projectId);
    if (hasDOIAssigned) {
        return {error: "Can not delete a project that has any experiment with a DOI assigned"}
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

    let processIdList = yield r.table("project2process")
        .getAll(projectId, {index: "project_id"}).getField('process_id');

    let fileIdList = yield r.table("project2datafile")
        .getAll(projectId, {index: "project_id"}).getField('datafile_id');

    results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    let deletedExperiments = [];
    for (let i = 0; i < experimentList.length; i++) {
        let experiment = experimentList[i];
        let results = yield experimentDelete
            .deleteExperimentFull(projectId, experiment.id, {deleteProcesses: true, dryRun: dryRun});
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
            processes: processIdList,
            samples: samples
        }
    };

    if (!dryRun) {
        yield deleteSamples(samples);
        yield deleteProcesses(processIdList);
        yield deleteFiles(fileIdList);
        yield deleteLinks(projectId);
        yield deleteProjectRecord(projectId);
    }

    return ret;
}

function* testForPublishedDatasets(projectId) {

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    for (let i = 0; i < experimentList.length; i++) {
        let datasetList = experimentList[i].datasets;
        for (let j = 0; j < datasetList.length; j++) {
            if (datasetList[j].published) {
                return true;
            }
        }
    }
    return false;
}

function* testForDOIAssigned(projectId) {

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    for (let i = 0; i < experimentList.length; i++) {
        let datasetList = experimentList[i].datasets;
        for (let j = 0; j < datasetList.length; j++) {
            if (datasetList[j].doi) {
                return true;
            }
        }
    }
    return false;
}

function* deleteSamples(samples) {
    let sampleIdList = [];
    samples.forEach((sample) => {
        sampleIdList.push(sample.id);
    });
    yield r.table("samples").getAll(r.args(sampleIdList)).delete();
}

function* deleteProcesses(processIdList) {
    yield r.table("processes").getAll(r.args(processIdList)).delete();
}

function* deleteFiles(fileIdList) {
    for (let i = 0; i < fileIdList.length; i++) {
        yield files.deleteFile(fileIdList[i]);
    }
}

function* deleteLinks(projectId) {
    let tables = [
        'project2datadir',
        'project2datafile',
        'project2experiment',
        'project2process',
        'project2sample',
        'access'
    ];

    for (let i = 0; i < tables.length; i++) {
        yield r.table(tables[i]).getAll(projectId, {index: 'project_id'}).delete();
    }
}

function* deleteProjectRecord(projectId) {
    yield r.table("projects").get(projectId).delete();
}

function* quickProjectDelete(projectId) {
    yield r.table('projects').get(projectId).update({owner: 'delete@materialscommons.org'});
    yield r.table('access').getAll(projectId, {index: 'project_id'}).delete();
}

module.exports = {
    deleteProject,
    quickProjectDelete
};
