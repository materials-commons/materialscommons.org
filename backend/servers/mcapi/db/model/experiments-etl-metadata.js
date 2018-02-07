const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

// GET/PUT/POST rest-path/project/id/experiment/id/metadata/[id]

function* create_metadata(experiment_id, metadata_json) {

}

function* update_metadata(metadata_id, metadata_json) {

}

function* get_metadata_by_id(metadata_id) {

}

function* get_metadata_by_experiment_id(experiment_id) {

}

function* delete_metadata(metadata_id) {

}


module.exports = {
    create_metadata,
    update_metadata,
    get_metadata_by_id,
    get_metadata_by_experiment_id,
    delete_metadata
}