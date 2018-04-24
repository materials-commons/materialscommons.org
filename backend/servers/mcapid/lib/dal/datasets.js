const r = require('../../../shared/r');
const model = require('../../../shared/model');
const db = require('./db');
const dbExec = require('./run');
const commonQueries = require('../../../lib/common-queries');

async function createDataset(ds, owner, projectId) {
    let dataset = new model.Dataset(ds.title, owner);
    dataset.description = ds.description;
    let createdDS = await db.insert('datasets', dataset);
    let e2p = {
        project_id: projectId,
        dataset_id: createdDS.id
    };
    await r.table('project2dataset').insert(e2p);
    return createdDS;
}

async function deleteDataset(datasetId) {
    await r.table('project2dataset').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('datasets').get(datasetId).delete();
    await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('comments').getAll(datasetId, {index: 'item_id'}).delete();
    return true;
}

async function getDatasetsForProject(projectId) {
    let rql = r.table('project2dataset').getAll(projectId, {index: 'experiment_id'})
        .eqJoin('dataset_id', r.table('datasets')).zip()
        .merge((ds) => {
            return {
                samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'}).count(),
                processes: r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'}).count(),
                files: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
                comments: r.table('comments').getAll(ds('id'), {index: 'item_id'}).count()
            }
        });
    return await dbExec(rql);
}

async function getDataset(datasetId) {
    let rql = commonQueries.datasetDetailsRql(r.table('datasets').get(datasetId), r);
    return await dbExec(rql);
}

async function updateDataset(datasetId, ds) {
    await r.table('datasets').get(datasetId).update(ds);
    return await getDataset(datasetId);
}

async function addFilesToDataset(datasetId, files) {
    const filesToAdd = files.map(fid => ({dataset_id: datasetId, datafile_id: fid}));
    await r.table('dataset2datafiles').insert(filesToAdd, {conflict: 'update'});
    return await getDataset(datasetId);
}

async function deleteFilesFromDataset(datasetId, files) {
    const filesToDelete = files.map(fid => [datasetId, fid]);
    await r.table('dataset2datafiles').getAll(r.args(filesToDelete), {index: 'dataset_datafile'}).delete();
    return await getDataset(datasetId);
}

async function addSamplesToDataset(datasetId, samples) {
    const samplesToAdd = samples.map(sid => ({dataset_id: datasetId, sample_id: sid}));
    await r.table('dataset2sample').insert(samplesToAdd, {conflict: 'update'});
    return await getDataset(datasetId);
}

async function deleteSamplesFromDataset(datasetId, samples) {
    const samplesToDelete = samples.map(sid => [datasetId, sid]);
    await r.table('dataset2sample').getAll(r.args(samplesToDelete), {index: 'dataset_sample'}).delete();
    return await getDataset(datasetId);
}

async function deleteProcessesFromDataset(datasetId, processes) {
    const processesToDelete = processes.map(pid => [datasetId, pid]);
    await r.table('dataset2sample').getAll(r.args(processesToDelete), {index: 'dataset_process'}).delete();
    return await getDataset(datasetId);
}

module.exports = {
    createDataset,
    deleteDataset,
    getDatasetsForProject,
    getDataset,
    updateDataset,
    addFilesToDataset,
    deleteFilesFromDataset,
    addSamplesToDataset,
    deleteSamplesFromDataset,
    deleteProcessesFromDataset,
};