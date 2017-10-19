const r = require('actionhero').api.r;
const fs = require("fs");
const Promise = require("bluebird");
const mkdirpAsync = Promise.promisify(require('mkdirp'));
const archiver = require('archiver');

const dbExec = require('./run');
const db = require('./db');
const model = require('./model');
const commonQueries = require('../lib/common-queries');
const _ = require('lodash');
const util = require('./util');
const zipFileUtils = require('../lib/zipFileUtils');
const path = require('path');

async function getDatasetsForExperiment(experimentId) {
    let rql = r.table('experiment2dataset').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('dataset_id', r.table('datasets')).zip()
        .merge((ds) => {
            return {
                samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'}).count(),
                processes: r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'}).count(),
                files: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count()
            }
        });
    let dataset = await dbExec(rql);
    return {val: dataset};
}

async function getDataset(datasetId) {
    let rql = commonQueries.datasetDetailsRql(r.table('datasets').get(datasetId), r);
    let dataset = await rql.run();
    return {val: dataset};
}

async function createDatasetForExperiment(experimentId, userId, datasetArgs) {
    let dataset = new model.Dataset(datasetArgs.title, userId);
    dataset.description = datasetArgs.description;
    let created = await db.insert('datasets', dataset);
    let e2d = new model.Experiment2Dataset(experimentId, created.id);
    await r.table('experiment2dataset').insert(e2d);
    return await getDataset(created.id);
}

async function deleteDataset(datasetId) {
    let results = await getDataset(datasetId);
    let dataset = results.val;
    if (dataset.published || dataset.doi) {
        return {val: false};
    }
    await r.table('datasets').get(datasetId).delete();
    await r.table('experiment2dataset').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2process').getAll(datasetId, {index: 'dataset_id'}).delete();
    await r.table('dataset2experimentnote').getAll(datasetId, {index: 'dataset_id'}).delete();
    return {val: true};
}

async function addSampleToDataset(datasetId, sampleId) {
    let d2s = new model.Dataset2Sample(datasetId, sampleId);
    await r.table('dataset2sample').insert(d2s);
    await addProcessesForSampleToDataset(datasetId, sampleId);
    return await getDataset(datasetId);
}

async function addProcessesForSampleToDataset(datasetId, sampleId) {
    let processes = await r.table('process2sample').getAll(sampleId, {index: 'sample_id'});
    let uniqProcesses = uniqByKey(processes, 'process_id');
    let processesToInsert = uniqProcesses.map(p => new model.Dataset2Process(datasetId, p.process_id));
    processesToInsert = await removeExistingProcessEntries(processesToInsert);
    if (processesToInsert.length) {
        await r.table('dataset2process').insert(processesToInsert);
    }
}

async function removeExistingProcessEntries(processesToAdd) {
    if (processesToAdd.length) {
        let indexEntries = processesToAdd.map(p => [p.dataset_id, p.process_id]);
        let matchingEntries = await r.table('dataset2process').getAll(r.args(indexEntries), {index: 'dataset_process'});
        let matchingEntriesByProcessId = _.keyBy(matchingEntries, 'process_id');
        return processesToAdd.filter(p => (!(p.process_id in matchingEntriesByProcessId)));
    }
    return processesToAdd;
}

async function updateSamplesInDataset(datasetId, samplesToAdd, samplesToDelete) {
    if (samplesToAdd.length) {
        let add = samplesToAdd.map(s => new model.Dataset2Sample(datasetId, s.id));
        add = await removeExistingSampleEntriesInDataset(add);
        if (add.length) {
            await r.table('dataset2sample').insert(add);
            let uniqueSampleIds = add.map(d2s => d2s.sample_id);
            let processes = await addProcessesForSamplesToDataset(datasetId, uniqueSampleIds);
            let processIds = processes.map(p => p.process_id);
            await addFilesForProcessesAndSamples(datasetId, processIds, uniqueSampleIds);
        }
    }

    if (samplesToDelete.length) {
        let toDelete = samplesToDelete.map(s => [datasetId, s.id]);
        await r.table('dataset2sample').getAll(r.args(toDelete), {index: 'dataset_sample'}).delete();
    }

    return await getDataset(datasetId);
}

async function getSamplesForDataset(datasetId) {
    let samples = await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'})
        .eqJoin('sample_id', r.table('samples')).zip();
    return {val: samples};
}

function uniqByKey(items, key) {
    let uniqItems = _.keyBy(items, key);
    return Object.keys(uniqItems).map(key => uniqItems[key]);
}

async function addProcessesForSamplesToDataset(datasetId, sampleIds) {
    let processes = await r.table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'});
    let uniqProcesses = uniqByKey(processes, 'process_id');
    let processesToInsert = uniqProcesses.map(p => new model.Dataset2Process(datasetId, p.process_id));
    processesToInsert = await removeExistingProcessEntries(processesToInsert);
    if (processesToInsert.length) {
        await r.table('dataset2process').insert(processesToInsert);
    }
    return uniqProcesses;
}

async function addFilesForProcessesAndSamples(datasetId, processIds, sampleIds) {
    let processFiles = await r.table('process2file').getAll(r.args(processIds), {index: 'process_id'});
    let sampleFiles = await r.table('sample2datafile').getAll(r.args(sampleIds), {index: 'sample_id'});
    let uniqFileIds = _.keys(_.keyBy(processFiles.concat(sampleFiles), 'datafile_id')).map(id => ({id: id}));
    if (uniqFileIds.length) {
        await updateFilesInDataset(datasetId, uniqFileIds, []);
    }
}

async function removeExistingSampleEntriesInDataset(samplesToAdd) {
    if (samplesToAdd.length) {
        let indexEntries = samplesToAdd.map(s => [s.dataset_id, s.sample_id]);
        let matchingEntries = await r.table('dataset2sample').getAll(r.args(indexEntries), {index: 'dataset_sample'});
        let matchingEntriesBySampleId = _.keyBy(matchingEntries, 'sample_id');
        return samplesToAdd.filter(s => (!(s.sample_id in matchingEntriesBySampleId)));
    }

    return samplesToAdd;
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

    return await getDataset(datasetId);
}

async function updateProcessesInDataset(datasetId, processesToAdd, processesToDelete) {
    if (processesToAdd.length) {
        let add = processesToAdd.map(p => new model.Dataset2Process(datasetId, p.id));
        let indexEntries = add.map(p => [p.dataset_id, p.process_id]);
        let matchingEntries = await r.table('dataset2process').getAll(r.args(indexEntries), {index: 'dataset_process'});
        add = util.removeExistingItemsIn(add, matchingEntries, 'process_id');
        if (add.length) {
            await r.table('dataset2process').insert(add);
        }
    }

    if (processesToDelete.length) {
        let toDelete = processesToDelete.map(p => [datasetId, p.id]);
        await r.table('dataset2process').getAll(r.args(toDelete), {index: 'dataset_process'}).delete();
    }

    return await getDataset(datasetId);
}

async function updateDataset(datasetId, datasetArgs) {
    await r.table('datasets').get(datasetId).update(datasetArgs);
    return await getDataset(datasetId);
}

async function publishDataset(datasetId) {
    await publishDatasetKeywords(datasetId);
    await publishDatasetProcesses(datasetId);
    await publishDatasetSamples(datasetId);
    await publishDatasetFiles(datasetId);
    // await publishDatasetZipFile(datasetId);  -- Note: this needs to be redesigned: see issue #846
    await r.table('datasets').get(datasetId).update({published: true});
    return await getDataset(datasetId);
}

/*
 * publishDatasetKeywords adds any dataset keywords to the tags in the published dataset
 * and associated those keywords with the published document. Keywords that are already
 * present are unchanged, association links that already exist are not added.
 */
async function publishDatasetKeywords(datasetId) {
    let dataset = await r.db('materialscommons').table('datasets').get(datasetId);
    let keywords = dataset['keywords'];
    let tags = keywords.map(id => {
        return {id: id};
    });
    let alreadyJoined = await r.db('mcpub').table('tag2dataset').filter({dataset_id: datasetId});
    alreadyJoined = alreadyJoined.map(doc => {
        return doc.tag;
    });
    alreadyJoined = new Set(alreadyJoined);
    let tagsToJoin = keywords.filter(key => {
        return !alreadyJoined.has(key);
    });
    let joins = tagsToJoin.map(tag => {
        return {tag: tag, dataset_id: datasetId};
    });
    await r.db('mcpub').table('tags').insert(tags, {conflict: 'update'});
    if (tagsToJoin.length > 0) {
        await r.db('mcpub').table('tag2dataset').insert(joins, {conflict: 'update'});
    }
}

async function publishDatasetProcesses(datasetId) {
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
    });
    await r.db('mcpub').table('process2setup').insert(p2sEntries);
}

async function publishDatasetSamples(datasetId) {
    await addSamplesToDataset(datasetId);
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
    let originalProcessIds = p2sEntries.map(e => e.process_id);
    let mcPubProcesses = await r.db('mcpub').table('processes').getAll(r.args(originalProcessIds), {index: 'original_id'});
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
    });
    await r.db('mcpub').table('process2sample').insert(p2sEntries);
}

async function addSamplesToDataset(datasetId) {
    let sampleIds = await r.table('dataset2process')
        .getAll(datasetId, {index: 'dataset_id'})
        .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'})
        .zip().pluck('sample_id').distinct();

    // Delete old entries for dataset in dataset2sample before inserting new entries
    await r.table('dataset2sample').getAll(datasetId, {index: 'dataset_id'}).delete();

    let samplesToAdd = sampleIds.map(s => new model.Dataset2Sample(datasetId, s.sample_id));
    await r.table('dataset2sample').insert(samplesToAdd);
}

async function publishDatasetFiles(datasetId) {
    await addFilesToDataset(datasetId);
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
    });
    await r.db('mcpub').table('process2file').insert(p2fEntries);
}

async function addFilesToDataset(datasetId) {
    let datasetProcessIds = await r.table('dataset2process')
        .getAll(datasetId, {index: 'dataset_id'}).pluck('process_id');
    let processIds = datasetProcessIds.map(d => d.process_id);

    let sampleProcessIds = await r.table('dataset2sample')
        .getAll(datasetId, {index: 'dataset_id'}).pluck('sample_id');
    let sampleIds = sampleProcessIds.map(d => d.sample_id);
    await addFilesForProcessesAndSamples(datasetId, processIds, sampleIds);
}

async function publishDatasetZipFile(datasetId) {
    let ds = await r.table('datasets').get(datasetId);
    let zipDirPath = zipFileUtils.zipDirPath(ds);
    let zipFilename = zipFileUtils.zipFilename(ds);
    let fillPathAndFilename = zipFileUtils.fullPathAndFilename(ds);

    await mkdirpAsync(zipDirPath);

    let ds2dfEntries = await r.table('dataset2datafile').getAll(datasetId, {index: 'dataset_id'});
    if (!ds2dfEntries.length) {
        return;
    }
    let datafileIds = ds2dfEntries.map(entry => entry.datafile_id);
    let datafiles = await r.table('datafiles').getAll(r.args(datafileIds));

    return new Promise(function (resolve, reject) {
        const archive = archiver('zip');
        const output = fs.createWriteStream(fillPathAndFilename);

        output.on('close', function () {
            const totalBytes = archive.pointer();
            const filename = zipFilename;
            r.table('datasets').get(datasetId).update({zipFilename: filename, zipSize: totalBytes})
                .then(resolve, reject);
        });

        archive.on('error', reject);

        archive.pipe(output);

        const seenThisOne = {};

        datafiles.forEach(df => {
            let zipEntry = zipFileUtils.zipEntry(df); // sets fileName, checksum, sourcePath
            let path = zipEntry.sourcePath;
            let name = zipEntry.fileName;
            let checksum = zipEntry.checksum;
            name = resolveZipfileFilenameDuplicates(seenThisOne, name, checksum);
            if (name) {
                archive.append(path, {name: name});
            }
        });

        archive.finalize();

    });
}

function resolveZipfileFilenameDuplicates(seenThisOne, name, checksum) {
    name = name.toLowerCase();

    if (name.startsWith(".")) {
        name = "dot" + name;
    }

    if (name in seenThisOne) {
        let count = 0;
        if (seenThisOne[name] === checksum) {
            return null;
        } else {
            let newName = resolveZipfileFilenameUnique(name, count);
            while (newName in seenThisOne) {
                count++;
                newName = resolveZipfileFilenameUnique(name, count);
            }
            name = newName;
        }
    }
    seenThisOne[name] = checksum;
    return name;
}

function resolveZipfileFilenameUnique(name, count) {
    let parts = path.parse(name);
    return parts.name + "_" + count + parts.ext;
}

async function unpublishDataset(datasetId) {
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

module.exports = {
    getDatasetsForExperiment,
    getDataset,
    createDatasetForExperiment,
    deleteDataset,
    addSampleToDataset,
    updateSamplesInDataset,
    getSamplesForDataset,
    updateFilesInDataset,
    updateProcessesInDataset,
    updateDataset,
    publishDataset,
    unpublishDataset
};