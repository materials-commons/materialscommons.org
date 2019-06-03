const model = require('@lib/model');
const dbExec = require('./run');
const commonQueries = require('@lib/common-queries');
const _ = require('lodash');
const util = require('@lib/util');

const doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';

module.exports = function(r) {

    const db = require('./db')(r);
    const {updateSelectedFiles} = require('./dir-utils')(r);

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
            await addProcessesToCreatedDataset(createdDS.id);
            await addFilesToCreatedDataset(createdDS.id);
        }
        return createdDS;
    }

    async function addProcessesToCreatedDataset(datasetId) {
        let d2s = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'});
        let sampleIds = d2s.map(e => e.sample_id);
        let processes = await r.table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'});
        let distinctProcesses = _.keys(_.keyBy(processes, 'process_id'));
        let processesToAdd = distinctProcesses.map(pid => ({process_id: pid, dataset_id: datasetId}));
        await r.table('dataset2process').insert(processesToAdd);
    }

    async function addFilesToCreatedDataset(datasetId) {
        let d2s = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'});
        let sampleIds = d2s.map(e => e.sample_id);
        let processes = await r.table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'});
        let distinctProcesses = _.keys(_.keyBy(processes, 'process_id'));
        let p2f = await r.table('process2file').getAll(r.args(distinctProcesses), {index: 'process_id'});
        let distinctFiles = _.keys(_.keyBy(p2f, 'datafile_id'));
        let filesToAdd = distinctFiles.map(fid => ({datafile_id: fid, dataset_id: datasetId}));
        await r.table('dataset2datafile').insert(filesToAdd);
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
                            };
                        }).coerceTo('array'),
                };
            });
        return await dbExec(rql);
    }

    async function getDataset(datasetId) {
        //let rql = commonQueries.datasetDetailsRql(r.table('datasets').get(datasetId), r);
        let rql = r.table('datasets').get(datasetId);
        let dataset = await dbExec(rql);
        if (dataset.doi !== '') {
            dataset.doi_url = `${doiUrl}id/${dataset.doi}`;
        }
        if (!dataset.published) {
            dataset.status = await canPublishDataset(datasetId);
            // dataset.status.files_count = dataset.files.length;
            if (dataset.status.files_count && dataset.status.samples_count && dataset.status.processes_count) {
                dataset.status.can_be_published = true;
            }
        }

        if (dataset.selection_id) {
            dataset.file_selection = await r.table('fileselection').get(dataset.selection_id);
        } else {
            dataset.file_selection = {
                include_files: [],
                exclude_files: [],
                include_dirs: [],
                exclude_dirs: [],
            };
        }
        return dataset;
    }

    async function getDatasetFiles(datasetId) {
        return await r.table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'})
            .eqJoin('datafile_id', r.table('datafiles')).zip()
            .merge(df => {
                return {
                    path: r.table('datadir2datafile').getAll(df('datafile_id'), {index: 'datafile_id'})
                        .eqJoin('datadir_id', r.table('datadirs')).zip().pluck('name').nth(0).getField('name')
                };
            });
    }

    async function getDatasetSamplesAndProcesses(datasetId) {
        return await r.table('datasets').get(datasetId).merge(ds => {
            return {
                samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
                processes: commonQueries.datasetProcessDetailsRql(r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('process_id', r.table('processes')).zip(), r).coerceTo('array'),
            };
        });
    }

    async function updateDatasetFileSelection(datasetId, selectionId, selection) {
        let id = await updateSelectedFiles(selection, selectionId);
        if (!selectionId) {
            // selection created for first time for dataset, so update dataset to contain the selection.
            await r.table('datasets').get(datasetId).update({selection_id: id});
        }

        return id;
    }

    async function canPublishDataset(datasetId) {
        let dsStatus = {
            files_count: 0,
            samples_count: 0,
            processes_count: 0,
            can_be_published: false
        };

        dsStatus.files_count = await getFilesCountForDataset(datasetId);
        dsStatus.samples_count = await getSamplesCountForDataset(datasetId);
        dsStatus.processes_count = await getProcessesCountForDataset(datasetId);
        if (dsStatus.files_count && dsStatus.samples_count && dsStatus.processes_count) {
            dsStatus.can_be_published = true;
        }

        return dsStatus;
    }

    async function getFilesCountForDataset(datasetId) {
        let datasetProcessIds = await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'}).pluck('process_id');
        let processIds = datasetProcessIds.map(d => d.process_id);

        let sampleProcessIds = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).pluck('sample_id');
        let sampleIds = sampleProcessIds.map(d => d.sample_id);
        let samplesAndProcessesFilesCount = await getFileCountsForProcessesAndSamples(datasetId, processIds, sampleIds);
        if (samplesAndProcessesFilesCount === 0) {
            let files = await getDatasetFiles(datasetId);
            return files.length;
        }

        return samplesAndProcessesFilesCount;
    }

    async function getFileCountsForProcessesAndSamples(datsetId, processIds, sampleIds) {
        let processFiles = await r.table('process2file').getAll(r.args(processIds), {index: 'process_id'});
        let sampleFiles = await r.table('sample2datafile').getAll(r.args(sampleIds), {index: 'sample_id'});
        let uniqFileIds = _.keys(_.keyBy(processFiles.concat(sampleFiles), 'datafile_id')).map(id => ({id: id}));
        return uniqFileIds.length;
    }

    async function getSamplesCountForDataset(datasetId) {
        let sampleIds = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).pluck('sample_id').distinct();
        return sampleIds.length;
    }

    async function getProcessesCountForDataset(datasetId) {
        let d2pEntries = await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'});
        return d2pEntries.length;
    }

    async function updateDataset(datasetId, ds) {
        await r.table('datasets').get(datasetId).update(ds);
        return await getDataset(datasetId);
    }

    async function addFilesToDataset(datasetId, files) {
        const filesToAdd = await createFilesToAdd(datasetId, files);
        if (filesToAdd.length) {
            await r.table('dataset2datafile').insert(filesToAdd, {conflict: 'update'});
        }
        return true;
    }

    async function addFilesAndDirectoriesToDataset(datasetId, files, directories) {
        await addFilesToDataset(datasetId, files);
        let ds = await r.table('datasets').get(datasetId);
        if (ds.selection_id) {
            await updateSelectedFiles(directories, ds.selection_id);
        } else {
            const selectionId = await updateSelectedFiles(directories);
            await r.table('datasets').get(datasetId).update({selection_id: selectionId});
        }
        return true;
    }

    async function createFilesToAdd(datasetId, files) {
        const filesToCheck = files.map(fid => [datasetId, fid]);
        let existingFiles = await r.table('dataset2datafile').getAll(r.args(filesToCheck), {index: 'dataset_datafile'});
        let existingFilesMap = _.keyBy(existingFiles, 'datafile_id');
        return files.filter(fid => (!(fid in existingFilesMap))).map(fid => ({dataset_id: datasetId, datafile_id: fid}));
    }

    async function deleteFilesFromDataset(datasetId, files) {
        const filesToDelete = files.map(fid => [datasetId, fid]);
        await r.table('dataset2datafile').getAll(r.args(filesToDelete), {index: 'dataset_datafile'}).delete();
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

    async function publish(datasetId) {
        await publishDatasetKeywords(datasetId);
        await publishProcesses(datasetId);
        await publishSamples(datasetId);
        await publishFiles(datasetId);
        await r.table('datasets').get(datasetId).update({published: true});
        return await getDataset(datasetId);
    }

    async function publishDatasetKeywords(datasetId) {
        let dataset = await r.db('materialscommons').table('datasets').get(datasetId);
        let keywords = dataset['keywords'];
        let tags = keywords.map(id => {
            return {id: id};
        });
        let existingTags = await r.db('mcpub').table('tag2dataset').filter({dataset_id: datasetId});
        existingTags = existingTags.map(doc => {
            return doc.tag;
        });
        existingTags = new Set(existingTags);
        let tagsToAddJoinTable = keywords.filter(key => {
            return !existingTags.has(key);
        });
        let existingTagJoins = tagsToAddJoinTable.map(tag => {
            return {tag: tag, dataset_id: datasetId};
        });

        await r.db('mcpub').table('tags').insert(tags, {conflict: 'update'});

        if (tagsToAddJoinTable.length > 0) {
            await r.db('mcpub').table('tag2dataset').insert(existingTagJoins, {conflict: 'update'});
        }
    }

    async function publishProcesses(datasetId) {
        let d2pEntries = await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'});
        let processIds = d2pEntries.map(entry => entry.process_id);
        let processes = await r.table('processes').getAll(r.args(processIds));
        processes.forEach(p => {
            p.original_id = p.id;
            delete p['id'];
        });
        let inserted = await r.db('mcpub').table('processes').insert(processes, {returnChanges: 'always'});
        let d2pToInsert = inserted.changes.map(e => new model.Dataset2Process(datasetId, e.new_val.id));
        let newProcesses = inserted.changes.map(e => e.new_val);
        await r.db('mcpub').table('dataset2process').insert(d2pToInsert);
        await publishSetupForProcesses(newProcesses);
    }

    /*
     * publishSetupForProcesses will go through the setup entries and the properties associated with the
     * setup entries. It will create new setup entries from the old setup entries, and then update all the
     * id mappings in the join tables and foreign indexes for the related tables.
     */
    async function publishSetupForProcesses(processes) {
        let originalProcessIds = processes.map(p => p.original_id);
        let p2sEntries = await r.table('process2setup').getAll(r.args(originalProcessIds), {index: 'process_id'});
        let setupIds = p2sEntries.map(e => e.setup_id);
        let setupEntries = await r.table('setups').getAll(r.args(setupIds));
        let setupProperties = await r.table('setupproperties').getAll(r.args(setupIds), {index: 'setup_id'});

        // Insert setupEntries into new database by creating new ids for each setup entry, and update
        // the setupproperties table to use the new ids.
        setupEntries.forEach(e => {
            e.original_id = e.id;
            delete e['id'];
        });
        let insertedSetups = await r.db('mcpub').table('setups').insert(setupEntries, {returnChanges: 'always'});
        let setupsByOriginalId = _.keyBy(insertedSetups.changes.map(e => e.new_val), 'original_id');

        // Modify setupproperties to point to the new ids for each setup.
        setupProperties.forEach(prop => {
            let setupEntry = setupsByOriginalId[prop.setup_id];
            prop.setup_id = setupEntry.id;
            delete prop['id'];
        });
        await r.db('mcpub').table('setupproperties').insert(setupProperties);

        // Update process2setup to use the new process id and the new setup id
        let processesByOriginalId = _.keyBy(processes, 'original_id');

        p2sEntries.forEach(e => {
            let process = processesByOriginalId[e.process_id];
            let setup = setupsByOriginalId[e.setup_id];
            if (process && setup) {
                e.setup_id = setup.id;
                e.process_id = process.id;
            } else {
                e.invalid = true;
            }
            delete e['id'];
        });
        await r.db('mcpub').table('process2setup').insert(p2sEntries);
    }

    async function publishSamples(datasetId) {
        await addSamplesToPublishedDataset(datasetId);
        let ds2sEntries = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'});
        let sampleIds = ds2sEntries.map(entry => entry.sample_id);
        let samples = await r.table('samples').getAll(r.args(sampleIds));
        samples.forEach(s => {
            s.original_id = s.id;
            delete s['id'];
        });
        let insertedSamples = await r.db('mcpub').table('samples').insert(samples, {returnChanges: 'always'});
        let ds2sToInsert = insertedSamples.changes.map(e => new model.Dataset2Sample(datasetId, e.new_val.id));
        await r.db('mcpub').table('dataset2sample').insert(ds2sToInsert);

        // Update process2sample table
        let newSamples = insertedSamples.changes.map(s => s.new_val);
        let originalSampleIds = newSamples.map(s => s.original_id);
        let p2sEntries = await r.table('process2sample').getAll(r.args(originalSampleIds), {index: 'sample_id'});
        let mcPubProcesses = await r.db('mcpub').table('dataset2process').getAll(datasetId, {index: 'dataset_id'})
            .eqJoin('process_id', r.db('mcpub').table('processes')).zip();
        let processesByOriginalId = _.keyBy(mcPubProcesses, 'original_id');
        let samplesByOriginalId = _.keyBy(newSamples, 'original_id');
        p2sEntries.forEach(e => {
            let process = processesByOriginalId[e.process_id];
            let sample = samplesByOriginalId[e.sample_id];
            if (process && sample) {
                e.process_id = process.id;
                e.sample_id = sample.id;
            } else {
                e.invalid = true;
            }
            delete e['id'];
        });
        await r.db('mcpub').table('process2sample').insert(p2sEntries);
    }

    async function addSamplesToPublishedDataset(datasetId) {
        let sampleIds = await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'})
            .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'})
            .zip().pluck('sample_id').distinct();

        // Delete old entries for dataset in dataset2sample before inserting new entries
        await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).delete();

        let samplesToAdd = sampleIds.map(s => new model.Dataset2Sample(datasetId, s.sample_id));
        await r.table('dataset2sample').insert(samplesToAdd);
    }

    async function publishFiles(datasetId) {
        await addFilesToPublishedDataset(datasetId);
        let ds2dfEntries = await r.table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'});
        if (!ds2dfEntries.length) {
            return;
        }
        let datafileIds = ds2dfEntries.map(entry => entry.datafile_id);
        let datafiles = await r.table('datafiles').getAll(r.args(datafileIds));
        datafiles.forEach(f => {
            f.original_id = f.id;
            delete f['id'];
        });
        let insertedDatafiles = await r.db('mcpub').table('datafiles').insert(datafiles, {returnChanges: 'always'});
        let ds2dfToInsert = insertedDatafiles.changes.map(f => new model.Dataset2Datafile(datasetId, f.new_val.id));
        await r.db('mcpub').table('dataset2datafile').insert(ds2dfToInsert);

        // Update process2file table
        let newDatafiles = insertedDatafiles.changes.map(f => f.new_val);
        let originalDFIds = newDatafiles.map(f => f.original_id);
        let p2fEntries = await r.table('process2file').getAll(r.args(originalDFIds), {index: 'datafile_id'});
        let originalProcessIds = p2fEntries.map(e => e.process_id);
        let mcPubProcesses = await r.db('mcpub').table('processes').getAll(r.args(originalProcessIds), {index: 'original_id'});
        let processesByOriginalId = _.keyBy(mcPubProcesses, 'original_id');
        let datafilesByOriginalId = _.keyBy(newDatafiles, 'original_id');
        p2fEntries.forEach(e => {
            let process = processesByOriginalId[e.process_id];
            let datafile = datafilesByOriginalId[e.datafile_id];
            if (process && datafile) {
                e.process_id = process.id;
                e.datafile_id = datafile.id;
            } else {
                e.invalid = true;
            }
            delete e['id'];
        });
        await r.db('mcpub').table('process2file').insert(p2fEntries);
    }

    async function addFilesToPublishedDataset(datasetId) {
        let datasetProcessIds = await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'}).pluck('process_id');
        let processIds = datasetProcessIds.map(d => d.process_id);

        let sampleProcessIds = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).pluck('sample_id');
        let sampleIds = sampleProcessIds.map(d => d.sample_id);
        await addFilesForProcessesAndSamples(datasetId, processIds, sampleIds);
    }

    async function addFilesForProcessesAndSamples(datasetId, processIds, sampleIds) {
        let processFiles = await r.table('process2file').getAll(r.args(processIds), {index: 'process_id'});
        let sampleFiles = await r.table('sample2datafile').getAll(r.args(sampleIds), {index: 'sample_id'});
        let uniqFileIds = _.keys(_.keyBy(processFiles.concat(sampleFiles), 'datafile_id')).map(id => ({id: id}));
        if (uniqFileIds.length) {
            await updateFilesInDataset(datasetId, uniqFileIds, []);
        }
    }

    async function updateFilesInDataset(datasetId, filesToAdd, filesToDelete) {
        if (filesToAdd.length) {
            let add = filesToAdd.map(f => new model.Dataset2Datafile(datasetId, f.id));
            let indexEntries = add.map(f => [f.dataset_id, f.datafile_id]);
            let matchingEntries = await r.table('dataset2datafile').getAll(r.args(indexEntries), {index: 'dataset_datafile'});
            add = util.removeExistingItemsIn(add, matchingEntries, 'datafile_id');
            if (add.length) {
                await r.table('dataset2datafile').insert(add);
            }
        }

        if (filesToDelete.length) {
            let toDelete = filesToDelete.map(f => [datasetId, f.id]);
            await r.table('dataset2datafile').getAll(r.args(toDelete), {index: 'dataset_datafile'}).delete();
        }
    }

    async function unpublish(datasetId) {
        await r.table('datasets').get(datasetId).update({published: false});
        await unpublishDatasetProcesses(datasetId);
        await unpublishDatasetSamples(datasetId);
        await unpublishDatasetFiles(datasetId);
        await unpublishDatasetTags(datasetId);
        return await getDataset(datasetId);
    }

    async function unpublishDatasetProcesses(datasetId) {
        let processes = await r.db('mcpub').table('dataset2process').getAll(datasetId, {index: 'dataset_id'});
        let processIds = processes.map(p => p.process_id);
        let process2setupEntries = await r.db('mcpub').table('process2setup').getAll(r.args(processIds), {index: 'process_id'});
        let setupIds = process2setupEntries.map(e => e.setup_id);
        await r.db('mcpub').table('processes').getAll(r.args(processIds)).delete();
        await r.db('mcpub').table('setups').getAll(r.args(setupIds)).delete();
        await r.db('mcpub').table('setupproperties').getAll(r.args(setupIds), {index: 'setup_id'}).delete();
        await r.db('mcpub').table('process2setup').getAll(r.args(processIds), {index: 'process_id'}).delete();
        await r.db('mcpub').table('dataset2process').getAll(datasetId, {index: 'dataset_id'}).delete();
    }

    async function unpublishDatasetSamples(datasetId) {
        let samples = await r.db('mcpub').table('dataset2sample').getAll(datasetId, {index: 'dataset_id'});
        let sampleIds = samples.map(s => s.sample_id);
        await r.db('mcpub').table('samples').getAll(r.args(sampleIds)).delete();
        await r.db('mcpub').table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'}).delete();
        await r.db('mcpub').table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).delete();
    }

    async function unpublishDatasetFiles(datasetId) {
        let datafiles = await r.db('mcpub').table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'});
        let datafileIds = datafiles.map(d => d.datafile_id);
        await r.db('mcpub').table('datafiles').getAll(r.args(datafileIds)).delete();
        await r.db('mcpub').table('process2file').getAll(r.args(datafileIds), {index: 'datafile_id'}).delete();
        await r.db('mcpub').table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'}).delete();
    }

    async function unpublishDatasetTags(datasetId) {
        let tags = await r.db('mcpub').table('tag2dataset').getAll(datasetId, {index: 'dataset_id'}).pluck(['tag']);
        await r.db('mcpub').table('tag2dataset').getAll(datasetId, {index: 'dataset_id'}).delete();
        tags = tags.map(tag => tag.tag);
        // not the best way? I'm convinced that this can be done with a single query, parhave in comibination
        // with the above, but I could not figure it out, and this works. Terry Weymouth - 6 Oct 2016
        for (let i = 0; i < tags.length; i++) {
            let count = await r.db('mcpub').table('tag2dataset').getAll(tags[i], {index: 'tag'}).count();
            if (count === 0) {
                await r.db('mcpub').table('tags').get(tags[i]).delete();
            }
        }
    }

    return {
        createDataset,
        deleteDataset,
        getDatasetsForProject,
        getDataset,
        getDatasetFiles,
        updateDatasetFileSelection,
        getDatasetSamplesAndProcesses,
        updateDataset,
        addFilesToDataset,
        addFilesAndDirectoriesToDataset,
        deleteFilesFromDataset,
        addSamplesToDataset,
        deleteSamplesFromDataset,
        deleteProcessesFromDataset,
        publish,
        unpublish
    };
};