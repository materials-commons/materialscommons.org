module.exports = function(experimentDatasets, experiments, samples, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        getDatasetsForExperiment,
        getDatasetForExperiment,
        createDatasetForExperiment,
        updateDatasetForExperiment,
        addSampleToDataset,
        updateSamplesInDataset,
        updateFilesInDataset,
        updateProcessesInDataset,
        getSamplesForDataset,
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

    function* updateDatasetForExperiment(next) {
        let datasetArgs = yield parse(this);
        schema.prepare(schema.updateDatasetSchema, datasetArgs);
        let errors = yield validateUpdateDataset(datasetArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experimentDatasets.updateDataset(this.params.dataset_id, datasetArgs);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateDataset(datasetArgs) {
        let errors = yield schema.validate(schema.updateDatasetSchema, datasetArgs);
        if (errors !== null) {
            return errors;
        }

        if (datasetArgs.authors && !_.isArray(datasetArgs.authors)) {
            return {error: `authors field must be an array`};
        } else if (datasetArgs.authors) {
            for (let author of datasetArgs.authors) {
                schema.prepare(schema.datasetAuthor, author);
                let e = yield schema.validate(schema.datasetAuthor, author);
                if (e !== null) {
                    return e;
                }
            }
        }

        if (datasetArgs.papers && !_.isArray(datasetArgs.papers)) {
            return {error: `papers field must be an array`};
        } else if (datasetArgs.papers) {
            for (let paper of datasetArgs.papers) {
                schema.prepare(schema.datasetPaper, paper);
                let e = yield schema.validate(schema.datasetPaper, paper);
                if (e !== null) {
                    return e;
                }
            }
        }

        if (datasetArgs.license && (!datasetArgs.license.name || !_.isString(datasetArgs.license.name))) {
            return {error: `license.name field must be a string`};
        } else if (datasetArgs.license && datasetArgs.license.name) {
            let license;
            switch (datasetArgs.license.name) {
                case `Public Domain Dedication and License (PDDL)`:
                    license = {
                        name: `Public Domain Dedication and License (PDDL)`,
                        link: `http://opendatacommons.org/licenses/pddl/summary/`
                    };
                    break;
                case `Attribution License (ODC-By)`:
                    license = {
                        name: `Attribution License (ODC-By)`,
                        link: `http://opendatacommons.org/licenses/by/summary/`
                    };
                    break;
                case `Open Database License (ODC-ODbL)`:
                    license = {
                        name: `Open Database License (ODC-ODbL)`,
                        link: `http://opendatacommons.org/licenses/odbl/summary/`
                    };
                    break;
                default:
                    return {error: `Unknown license ${datasetArgs.license.name}`};
            }
            datasetArgs.license = license;
        } else if (datasetArgs.license) {
            return {error: `license field requires a name`}
        }

        return null;
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

    function* updateFilesInDataset(next) {
        let fileArgs = yield parse(this);
        let errors = yield validateUpdateFilesInDataset(this.params.experiment_id, this.params.dataset_id, fileArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let addFiles = fileArgs.files.filter(s => s.command === 'add');
            let deleteFiles = fileArgs.files.filter(s => s.command === 'delete');
            let rv = yield experimentDatasets.updateFilesInDataset(this.params.dataset_id, addFiles, deleteFiles);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateFilesInDataset(experimentId, datasetId, filesArgs) {
        if (!filesArgs.files || !_.isArray(filesArgs.files)) {
            return {error: `Bad arguments files is a required field`};
        }
        let idsToAdd = [];
        let idsToDelete = [];
        for (let i = 0; i < filesArgs.files.length; i++) {
            let f = filesArgs.files[i];
            if (!_.isObject(f)) {
                return {error: `Bad arguments file is not an object ${f}`};
            } else if (!f.command || !f.id) {
                return {error: `Bad arguments no command or id ${f}`};
            } else if (f.command === 'add') {
                idsToAdd.push(f.id);
            } else if (f.command === 'delete') {
                idsToDelete.push(f.id);
            }
        }

        if (idsToAdd.length) {
            let allInExperiment = yield experiments.allFilesInExperiment(experimentId, idsToAdd);
            if (!allInExperiment) {
                return {error: `Some files not in experiment`};
            }
        }

        if (idsToDelete.length) {
            let allInDataset = yield experimentDatasets.allFilesInDataset(datasetId, idsToDelete);
            if (!allInDataset) {
                return {error: `Some files not in dataset`};
            }
        }

        if (!idsToAdd.length && !idsToDelete.length) {
            return {error: `No files to add or delete from dataset`};
        }

        return null;
    }

    function* updateProcessesInDataset(next) {
        let processArgs = yield parse(this);
        let errors = yield validateUpdateProcessesInDataset(this.params.experiment_id, this.params.dataset_id, processArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let addProcesses = processArgs.processes.filter(s => s.command === 'add');
            let deleteProcesses = processArgs.processes.filter(s => s.command === 'delete');
            let rv = yield experimentDatasets.updateProcessesInDataset(this.params.dataset_id, addProcesses, deleteProcesses);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateProcessesInDataset(experimentId, datasetId, processArgs) {
        if (!processArgs.processes || !_.isArray(processArgs.processes)) {
            return {error: `Bad arguments processes is a required field`};
        }
        let idsToAdd = [];
        let idsToDelete = [];
        for (let i = 0; i < processArgs.processes.length; i++) {
            let p = processArgs.processes[i];
            if (!_.isObject(p)) {
                return {error: `Bad arguments process is not an object ${p}`};
            } else if (!p.command || !p.id) {
                return {error: `Bad arguments no command or id ${p}`};
            } else if (p.command === 'add') {
                idsToAdd.push(p.id);
            } else if (p.command === 'delete') {
                idsToDelete.push(p.id);
            }
        }

        if (idsToAdd.length) {
            let allInExperiment = yield experiments.allProcessesInExperiment(experimentId, idsToAdd);
            if (!allInExperiment) {
                return {error: `Some processes not in experiment`};
            }
        }

        if (idsToDelete.length) {
            let allInDataset = yield experimentDatasets.allProcessesInDataset(datasetId, idsToDelete);
            if (!allInDataset) {
                return {error: `Some processes not in dataset`};
            }
        }

        if (!idsToAdd.length && !idsToDelete.length) {
            return {error: `No processes to add or delete from dataset`};
        }

        return null;
    }

    function* getSamplesForDataset(next) {
        let rv = yield experimentDatasets.getSamplesForDataset(this.params.dataset_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* publishDataset(next) {
        yield next;
    }
};
