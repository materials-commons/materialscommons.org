const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

// GET/PUT/POST rest-path/project/id/experiment/id/metadata/[id]

function* create(user_id, experiment_id, metadata_json) {
    let probe = yield dbExec(r.table("experiment_etl_metadata")
        .getAll(experiment_id, {index: 'experiment_id'}));
    if (probe && probe.length > 0) {
        // for now, only one metadata record per experiment
        let previous = probe[0];
        let id = previous.id;
        let updated = yield update(id, metadata_json);
        return updated;
    }
    let metadata = yield db.insert('experiment_etl_metadata',
        new model.ExperimentEtlMetadata(experiment_id, metadata_json, user_id));
    let ret = {error: `could not add experiment_etl_metadata for experiment_id = ${experiment_id}`};
    if (metadata) {
        ret = {data: metadata};
    }
    return ret;
}


function* update(metadata_id, metadata_json) {
    let updatedMetadata = yield db.update('experiment_etl_metadata', metadata_id,
        {'json': metadata_json});
    let ret = {error: `could not update experiment_etl_metadata for id = ${metadata_id}`};
    if (updatedMetadata) {
        ret = {data: updatedMetadata};
    }
    return ret;
}


function* get(metadata_id) {
    let metadata = yield dbExec(r.table("experiment_etl_metadata").get(metadata_id));
    let ret = {error: `experiment_etl_metadata not found for id = ${metadata_id}`};
    if (metadata)
        return {data: metadata};
    return ret;
}


function* getByExperimentId(experiment_id) {
    let metadata_list = yield dbExec(r.table("experiment_etl_metadata")
        .getAll(experiment_id, {index: 'experiment_id'}));
    let ret = {error: `experiment_etl_metadata not found for experiment_id = ${experiment_id}`};
    if (metadata_list && metadata_list.length > 0) {
        let metadata = metadata_list[0];
        return {data: metadata};
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
