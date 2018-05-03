const r = require('../../../shared/r');
const model = require('../../../shared/model');
const db = require('./db');
const dbExec = require('./run');
const commonQueries = require('../../../lib/common-queries');
const _ = require('lodash')

async function createDataset(ds, owner, projectId) {
    let dataset = new model.Dataset(ds.title, owner);
    dataset.description = ds.description;
    let createdDS = await db.insert('datasets', dataset);
    let e2p = {
        project_id: projectId,
        dataset_id: createdDS.id
    };
    await r.table('project2dataset').insert(e2p);
    if (ds.samples.length) {
        await addSamplesToDataset(createdDS.id, ds.samples);
    }
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
    let rql = r.table('project2dataset').getAll(projectId, {index: 'project_id'})
        .eqJoin('dataset_id', r.table('datasets')).zip()
        .merge((ds) => {
            return {
                samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
                processes: r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                files: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip()
                    .merge(df => {
                        return {
                            path: r.table('datadir2datafile').getAll(df('datafile_id'), {index: 'datafile_id'})
                                .eqJoin('datadir_id', r.table('datadirs')).zip().pluck('name').nth(0).getField('name'),
                        }
                    }).coerceTo('array'),
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
    const filesToAdd = await createFilesToAdd(datasetId, files)
    if (filesToAdd.length) {
        await r.table('dataset2datafile').insert(filesToAdd, {conflict: 'update'})
    }
    return await getDataset(datasetId);
}

async function createFilesToAdd (datasetId, files) {
    const filesToCheck = files.map(fid => [datasetId, fid])
    let existingFiles = await r.table('dataset2datafile').getAll(r.args(filesToCheck), {index: 'dataset_datafile'})
    let existingFilesMap = _.keyBy(existingFiles, 'datafile_id')
    return files.filter(fid => (!(fid in existingFilesMap))).map(fid => ({dataset_id: datasetId, datafile_id: fid}))
}

async function deleteFilesFromDataset(datasetId, files) {
    const filesToDelete = files.map(fid => [datasetId, fid]);
    await r.table('dataset2datafile').getAll(r.args(filesToDelete), {index: 'dataset_datafile'}).delete()
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