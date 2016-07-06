module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const commonQueries = require('./common-queries');

    return {
        getDatasetsForExperiment,
        getDataset,
        createDatasetForExperiment,
        addSampleToDataset,
        updateSamplesInDataset,
        allSamplesInDataset,
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
        return yield getDataset(datasetId);
    }

    function* updateSamplesInDataset(datasetId, samplesToAdd, samplesToDelete) {
        if (samplesToAdd.length) {
            let add = samplesToAdd.map(s => new model.Dataset2Sample(datasetId, s.id));
            add = yield removeExistingSampleEntriesInDataset(add);
            if (add.length) {
                yield r.table('dataset2sample').insert(add);
            }
        }

        if (samplesToDelete.length) {
            let toDelete = samplesToDelete.map(s => [datasetId, s.id]);
            yield r.table('dataset2sample').getAll(r.args(toDelete), {index: 'dataset_sample'}).delete();
        }

        return yield getDataset(datasetId);
    }

    function* removeExistingSampleEntriesInDataset(samplesToAdd) {
        if (samplesToAdd.length) {
            let indexEntries = samplesToAdd.map(s => [s]);
            let matchingEntries = yield r.table('dataset2sample').getAll(r.args(indexEntries), {index: 'dataset_sample'});
            let bySampleId = _.indexBy(matchingEntries, 'sample_id');
            return samplesToAdd.filter(s => (!(s.sample_id in bySampleId)));
        }

        return samplesToAdd;
    }

    function* allSamplesInDataset(datasetId, sampleIds) {
        let indexArgs = sampleIds.map(sid => [datasetId, sid]);
        let samples = yield r.table('dataset2sample').getAll(r.args(indexArgs), {index: 'dataset_sample'});
        return samples.length === sampleIds.length;
    }

    function* modifyDataset(datasetId, datasetArgs) {
        yield r.table('datasets').get(datasetId).update(datasetArgs);
        return yield getDataset(datasetId);
    }

    function* publishDataset() {
        return {error: `Not implemented`};
    }
};
