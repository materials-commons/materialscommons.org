const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

// GET/PUT/POST rest-path/project/id/experiment/id/metadata/[id]

function* create(user_id, experiment_id, metadata_json) {
    let metadata = yield db.insert('experiment_etl_metadata',
        new model.ExperimentEtlMetadata(experiment_id, metadata_json, user_id));
    let ret = {error: `could not add experiment_etl_metadata for experiment_id = ${experiment_id}`};
    if (metadata) {
        ret = {val: metadata};
    }
    return ret;
}


function* update(metadata_id, metadata_json) {
    let updatedMetadata = yield db.update('experiment_etl_metadata', metadata_id,
        {'json': metadata_json});
    let ret = {error: `could not update experiment_etl_metadata for id = ${metadata_id}`};
    if (updatedMetadata) {
        ret = {val: updatedMetadata};
    }
    return ret;
}


function* get(metadata_id) {
    let metadata = yield dbExec(r.table("experiment_etl_metadata").get(metadata_id));
    let ret = {error: `experiment_etl_metadata not found for id = ${metadata_id}`};
    if (metadata)
        return {val: metadata};
    return ret;
}


function* getByExperimentId(experiment_id) {
    let metadata_list = yield dbExec(r.table("experiment_etl_metadata")
        .getAll(experiment_id, {index: 'experiment_id'}));
    let ret = {error: `experiment_etl_metadata not found for experiment_id = ${experiment_id}`};
    if (metadata_list && metadata_list.length > 0) {
        let metadata = metadata_list[0];
        return {val: metadata};
    }
    return ret;
}


function* remove(metadata_id) {
    let results = yield dbExec(r.table("experiment_etl_metadata").get(metadata_id).delete());
    return (results['deleted'] === 1)
}


module.exports = {
    create,
    update,
    get,
    getByExperimentId,
    remove
};
