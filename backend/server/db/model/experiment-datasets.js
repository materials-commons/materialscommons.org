module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const commonQueries = require('./common-queries');

    return {
        getDatasetsForExperiment,
        getDataset,
        createDatasetForExperiment,
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

    function* modifyDataset(datasetId, datasetArgs) {
        yield r.table('datasets').get(datasetId).update(datasetArgs);
        return yield getDataset(datasetId);
    }

    function* publishDataset() {
        return {error: `Not implemented`};
    }
};
