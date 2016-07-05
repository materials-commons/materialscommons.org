module.exports = function(experimentDatasets, schema) {
    const parse = require('co-body');
    const status = require('http-status');

    return {
        getDatasetsForExperiment,
        getDatasetForExperiment,
        createDatasetForExperiment,
        modifyDatasetForExperiment,
        publishDataset
    };

    function* getDatasetsForExperiment(next) {
        let rv = yield experimentDatasets.getDatasetsForExperiment(this.params.experiment_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* getDatasetForExperiment(next) {
        let rv = yield experimentDatasets.getDataset(this.params.dataset_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* createDatasetForExperiment(next) {
        let datasetArgs = yield parse(this);
        schema.prepare(schema.createDatasetSchema, datasetArgs);
        let errors = yield schema.validate(schema.createDatasetSchema, datasetArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experimentDatasets.createDatasetForExperiment(this.params.experiment_id, this.reqctx.user.id, datasetArgs);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* modifyDatasetForExperiment(next) {
        let datasetArgs = yield parse(this);
        schema.prepare(schema.updateDatasetSchema, datasetArgs);
        let errors = yield schema.validate(schema.updateDatasetSchema, datasetArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = experimentDatasets.modifyDataset(this.params.dataset_id, datasetArgs);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* publishDataset(next) {
        yield next;
    }
};
