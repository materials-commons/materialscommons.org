const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

const experimentDatasets = require('./experiment-datasets');

function* deleteExperiment(experimentId,options) {

    let deleteProcesses = !!options.deleteProcesses;
    let dryRun = !!options.dryRun;

    let overallResults = {}

    let results = yield experimentDatasets.getDatasetsForExperiment(experimentId);
    let dataset_list = results.val;

    let hasPublishedDatasets = false;
    for (let i = 0; i < dataset_list.length; i++) {
        let dataset = dataset_list[i];
        if (dataset.published) {
            hasPublishedDatasets = true;
        }
    }
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let idList = [];
    for (let i = 0; i < dataset_list.length; i++) {
        let dataset = dataset_list[i];
        idList.push(dataset.id)
        yield experimentDatasets.deleteDataset(dataset.id);
    }
    overallResults['datasets'] = idList;

    return {val: overallResults};
}

module.exports = {
    deleteExperiment
};