module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const commonQueries = require('./common-queries');
    const _ = require('lodash');
    const util = require('./util');

    return {
        getDatasetsForExperiment,
        getDataset,
        createDatasetForExperiment,
        addSampleToDataset,
        updateSamplesInDataset,
        updateFilesInDataset,
        allSamplesInDataset,
        allFilesInDataset,
        modifyDataset,
        publishDataset
    };

    function* getDatasetsForExperiment(experimentId) {
        let rql = commonQueries.datasetDetailsRql(r.table('experiment2dataset').getAll(experimentId, {index: 'experiment_id'})
            .eqJoin('dataset_id', r.table('datasets')).zip(), r);
        let dataset = yield dbExec(rql);
        return {val: dataset};
    }

    function* getDataset(datasetId) {
        let rql = commonQueries.datasetDetailsRql(r.table('datasets').get(datasetId), r);
        let dataset = yield dbExec(rql);
        return {val: dataset};
    }

    function* createDatasetForExperiment(experimentId, userId, datasetArgs) {
        let dataset = new model.Dataset(datasetArgs.title, userId);
        dataset.description = datasetArgs.description;
        let created = yield db.insert('datasets', dataset);
        let e2d = new model.Experiment2Dataset(experimentId, created.id);
        yield r.table('experiment2dataset').insert(e2d);
        return yield getDataset(created.id);
    }

    function* addSampleToDataset(datasetId, sampleId) {
        let d2s = new model.Dataset2Sample(datasetId, sampleId);
        yield r.table('dataset2sample').insert(d2s);
        yield addProcessesForSampleToDataset(datasetId, sampleId);
        return yield getDataset(datasetId);
    }

    function* addProcessesForSampleToDataset(datasetId, sampleId) {
        let processes = yield r.table('process2sample').getAll(sampleId, {index: 'sample_id'});
        let uniqProcesses = uniqByKey(processes, 'process_id');
        let processesToInsert = uniqProcesses.map(p => new model.Dataset2Process(datasetId, p.process_id));
        processesToInsert = yield removeExistingProcessEntries(processesToInsert);
        if (processesToInsert.length) {
            yield r.table('dataset2process').insert(processesToInsert);
        }
    }

    function* removeExistingProcessEntries(processesToAdd) {
        if (processesToAdd.length) {
            let indexEntries = processesToAdd.map(p => [p.dataset_id, p.process_id]);
            let matchingEntries = yield r.table('dataset2process').getAll(r.args(indexEntries), {index: 'dataset_process'});
            let matchingEntriesByProcessId = _.indexBy(matchingEntries, 'process_id');
            return processesToAdd.filter(p => (!(p.process_id in matchingEntriesByProcessId)));
        }
        return processesToAdd;
    }

    function* updateSamplesInDataset(datasetId, samplesToAdd, samplesToDelete) {
        if (samplesToAdd.length) {
            let add = samplesToAdd.map(s => new model.Dataset2Sample(datasetId, s.id));
            add = yield removeExistingSampleEntriesInDataset(add);
            if (add.length) {
                yield r.table('dataset2sample').insert(add);
                yield addProcessesForSamplesToDataset(datasetId, samplesToAdd);
            }
        }

        if (samplesToDelete.length) {
            let toDelete = samplesToDelete.map(s => [datasetId, s.id]);
            yield r.table('dataset2sample').getAll(r.args(toDelete), {index: 'dataset_sample'}).delete();
        }

        return yield getDataset(datasetId);
    }

    function uniqByKey(items, key) {
        let uniqItems = _.indexBy(items, key);
        return Object.keys(uniqItems).map(key => uniqItems[key]);
    }

    function* addProcessesForSamplesToDataset(datasetId, samples) {
        let sampleIds = samples.map(s => s.id);
        let processes = yield r.table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'});
        let uniqProcesses = uniqByKey(processes, 'process_id');
        let processesToInsert = uniqProcesses.map(p => new model.Dataset2Process(datasetId, p.process_id));
        processesToInsert = yield removeExistingProcessEntries(processesToInsert);
        if (processesToInsert.length) {
            yield r.table('dataset2process').insert(processesToInsert);
        }
    }

    function* removeExistingSampleEntriesInDataset(samplesToAdd) {
        if (samplesToAdd.length) {
            let indexEntries = samplesToAdd.map(s => [s.dataset_id, s.sample_id]);
            let matchingEntries = yield r.table('dataset2sample').getAll(r.args(indexEntries), {index: 'dataset_sample'});
            let matchingEntriesBySampleId = _.indexBy(matchingEntries, 'sample_id');
            return samplesToAdd.filter(s => (!(s.sample_id in matchingEntriesBySampleId)));
        }

        return samplesToAdd;
    }

    function* updateFilesInDataset(datasetId, filesToAdd, filesToDelete) {
        if (filesToAdd.length) {
            let add = filesToAdd.map(f => new model.Dataset2Datafile(datasetId, f.id));
            let indexEntries = add.map(f => [f.dataset_id, f.datafile_id]);
            let matchingEntries = yield r.table('dataset2datafile').getAll(r.args(indexEntries), {index: 'dataset_datafile'});
            add = util.removeExistingItemsIn(add, matchingEntries, 'datafile_id');
            if (add.length) {
                yield r.table('dataset2datafile').insert(add);
            }
        }

        if (filesToDelete.length) {
            let toDelete = filesToDelete.map(f => [datasetId, f.id]);
            yield r.table('dataset2datafile').getAll(r.args(toDelete), {index: 'dataset_datafile'}).delete();
        }

        return yield getDataset(datasetId);
    }

    function* allSamplesInDataset(datasetId, sampleIds) {
        let indexArgs = sampleIds.map(sid => [datasetId, sid]);
        let samples = yield r.table('dataset2sample').getAll(r.args(indexArgs), {index: 'dataset_sample'});
        return samples.length === sampleIds.length;
    }

    function* allFilesInDataset(datasetId, fileIds) {
        let indexArgs = fileIds.map(fid => [datasetId, fid]);
        let files = yield r.table('dataset2datafile').getAll(r.args(indexArgs), {index: 'dataset_datafile'});
        return files.length === fileIds.length;
    }

    function* modifyDataset(datasetId, datasetArgs) {
        yield r.table('datasets').get(datasetId).update(datasetArgs);
        return yield getDataset(datasetId);
    }

    function* publishDataset() {
        return {error: `Not implemented`};
    }
};
