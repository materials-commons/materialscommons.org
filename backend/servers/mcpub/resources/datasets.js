'use strict';

const status = require('http-status');
const fs = require('fs');
const Promise = require('bluebird');
const fsa = Promise.promisify(fs);

class Datasets {

    constructor(db_datasets) {
        this.db_datasets = db_datasets;
    }

    *getZipfileLocation(next){
        let rv = yield db_datasets.getZipfileLocation(this.params.dataset_id);
        if (rv.error) {
            this.status = status.UNAUTHORIZED;
            this.body = rv;
        } else {
            let value = rv.val;
            let path = value.path;
            let name = value.name;
            let accessRet = yield fsa.accessAsync(path);
            if (accessRet.error) {
                this.status = status.BAD_REQUEST;
                this.body = "Dataset ZIP file unavailable for dataset: " + name;
            } else {
                this.body = path;
            }
        }
        yield next;
    }

};

let datasets = null;

module.exports = function(db_datasets) {
    if (!datasets) {
        datasets = new Datasets(db_datasets);
    }

    return datasets;
};
