const r = require('../r');

const experiments = require('./experiments');
const experimentDelete = require('./experiment-delete');
const projects = require('./projects');
const files = require('./files');

async function deleteProject(projectId, options) {

    let dryRun = !!(options && options.dryRun);

    let errorAddIn =
        " WARNING. The project may have been partially deleted - project state unknown.";

    let hasPublishedDatasets = await testForPublishedDatasets(projectId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete a project that has any experiment with a published datasets"}
    }

    let hasDOIAssigned = await testForDOIAssigned(projectId);
    if (hasDOIAssigned) {
        return {error: "Can not delete a project that has any experiment with a DOI assigned"}
    }

    let results = await projects.getProject(projectId);

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

    let processIdList = await r.table("project2process")
        .getAll(projectId, {index: "project_id"}).getField('process_id');

    let fileIdList = await r.table("project2datafile")
        .getAll(projectId, {index: "project_id"}).getField('datafile_id');

    results = await experiments.getAllForProject(projectId);
    let experimentList = results.val;

    let deletedExperiments = [];
    for (let i = 0; i < experimentList.length; i++) {
        let experiment = experimentList[i];
        let results = await experimentDelete
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
        await deleteSamples(samples);
        await deleteProcesses(processIdList);
        await deleteFiles(fileIdList);
        await deleteLinks(projectId);
        await deleteProjectRecord(projectId);
    }

    return ret;
}

async function testForPublishedDatasets(projectId) {

    let results = await experiments.getAllForProject(projectId);
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

async function testForDOIAssigned(projectId) {

    let results = await experiments.getAllForProject(projectId);
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

async function deleteSamples(samples) {
    let sampleIdList = [];
    samples.forEach((sample) => {
        sampleIdList.push(sample.id);
    });
    await r.table("samples").getAll(r.args(sampleIdList)).delete();
}

async function deleteProcesses(processIdList) {
    await r.table("processes").getAll(r.args(processIdList)).delete();
}

async function deleteFiles(fileIdList) {
    for (let i = 0; i < fileIdList.length; i++) {
        await files.deleteFile(fileIdList[i]);
    }
}

async function deleteLinks(projectId) {
    let tables = [
        'project2datadir',
        'project2datafile',
        'project2experiment',
        'project2process',
        'project2sample',
        'access'
    ];

    for (let i = 0; i < tables.length; i++) {
        await r.table(tables[i]).getAll(projectId, {index: 'project_id'}).delete();
    }
}

async function deleteProjectRecord(projectId) {
    await r.table("projects").get(projectId).delete();
}

async function quickProjectDelete(projectId) {
    await r.table('projects').get(projectId).update({owner: 'delete@materialscommons.org'});
    await r.table('access').getAll(projectId, {index: 'project_id'}).delete();
}

module.exports = {
    deleteProject,
    quickProjectDelete
};
