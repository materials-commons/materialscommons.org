module.exports = function(experimentDatasets, experiments, samples, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        getDatasetsForExperiment,
        getDatasetForExperiment,
        createDatasetForExperiment,
        modifyDatasetForExperiment,
        addSampleToDataset,
        updateSamplesInDataset,
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

    function* addSampleToDataset(next) {
        let rv = yield experimentDatasets.addSampleToDataset(this.params.dataset_id, this.params.sample_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* updateSamplesInDataset(next) {
        let sampleArgs = yield parse(this);
        let errors = yield validateUpdateSamplesInDataset(this.params.experiment_id, this.params.dataset_id, sampleArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let addSamples = sampleArgs.samples.filter(s => s.command === 'add');
            let deleteSamples = sampleArgs.samples.filter(s => s.command === 'delete');
            let rv = yield experimentDatasets.updateSamplesInDataset(this.params.dataset_id, addSamples, deleteSamples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateSamplesInDataset(experimentId, datasetId, sampleArgs) {
        if (!sampleArgs.samples || !_.isArray(sampleArgs.samples)) {
            return {error: `Bad arguments samples is a required field`};
        }
        let idsToAdd = [];
        let idsToDelete = [];
        for (let i = 0; i < sampleArgs.samples.length; i++) {
            let s = sampleArgs.samples[i];
            if (!_.isObject(s)) {
                return {error: `Bad arguments sample is not an object ${s}`};
            } else if (!s.command || !s.id) {
                return {error: `Bad arguments no command or id ${s}`};
            } else if (s.command === 'add') {
                idsToAdd.push(s.id);
            } else if (s.command === 'delete') {
                idsToDelete.push(s.id);
            }
        }

        if (idsToAdd.length) {
            let allInExperiment = yield experiments.allSamplesInExperiment(experimentId, idsToAdd);
            if (!allInExperiment) {
                return {error: `Some samples not in experiment`};
            }
        }

        if (idsToDelete.length) {
            let allInDataset = yield experimentDatasets.allSamplesInDataset(datasetId, idsToDelete);
            if (!allInDataset) {
                return {error: `Some samples not in dataset`};
            }
        }

        if (!idsToAdd.length && !idsToDelete.length) {
            return {error: `No samples to add or delete from dataset`};
        }

        return null;
    }

    function* publishDataset(next) {
        yield next;
    }
};
