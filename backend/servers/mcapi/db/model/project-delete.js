const r = require('../r');
const db = require('./db');

const experiments = require('./experiments');
const processes = require('./processes');

function* deleteProject(projectId, options) {

    let dryRun = !!(options && options.dryRun);

    let hasPublishedDatasets = yield testForPublishedDatasets(projectId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    return {val: "there is more..."};
}

module.exports = {
    deleteProject
};


function* testForPublishedDatasets(projectId){

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    for (let i = 0; i < experimentList.length; i++) {
        let datasetList = experimentList[i].datasets;
        for (let j = 0; j < datasetList.length; j++) {
            let dataset = datasetList[j];
            if (datasetList[j].published) {
                return true;
            }
        }
    }
    return false;
}