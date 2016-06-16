module.exports = function(samples, experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        addSamplesToExperiment,
        updateExperimentSamples,
        deleteSamplesFromExperiment
    };

    function* addSamplesToExperiment(next) {
        let addArgs = yield parse(this);
        let errors = yield validateAddSamples(this.params.project_id, this.params.experiment_id, addArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.addSamples(this.params.experiment_id, addArgs.samples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateAddSamples(projectId, experimentId, addArgs) {
        let experimentInProject = yield experiments.experimentExistsInProject(projectId, experimentId);
        if (!experimentInProject) {
            return {error: 'No such experiment'};
        }

        if (!validAddSampleArgs(addArgs)) {
            return {error: `Badly formed list of samples`};
        }

        let allSamplesInProject = yield samples.allSamplesInProject(projectId, addArgs.samples);
        if (!allSamplesInProject) {
            return {error: `Some samples are not in project`};
        }

        return null;
    }

    function validAddSampleArgs(args) {
        if (!args.samples || !_.isArray(args.samples)) {
            return false;
        }

        for (let sample in args.samples) {
            if (!_.isString(sample)) {
                return false;
            }
        }

        return true;
    }

    function* updateExperimentSamples(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateSamples(this.params.project_id, this.params.experiment_id, updateArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield samples.updateSamples(updateArgs.samples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateSamples(projectId, experimentId, args) {
        if (!args.process_id || !_.isString(args.process_id) || args.process_id === "") {
            return {error: `Invalid process supplied`};
        }

        if (!args.samples || !_.isArray(args.samples)) {
            return {error: `Invalid samples supplied`};
        }

        let sampleIds = args.samples.map((s) => s.id);

        return yield validateSamples(projectId, experimentId, sampleIds);
    }

    function* deleteSamplesFromExperiment(next) {
        let deleteArgs = yield parse(this);
        let errors = yield validateDeleteSamples(this.params.project_id, this.params.experiment_id, deleteArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.deleteSamplesFromExperiment(this.params.experiment_id, deleteArgs.process_id,
                deleteArgs.samples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateDeleteSamples(projectId, experimentId, args) {
        if (!args.process_id || !_.isString(args.process_id) || args.process_id === "") {
            return {error: `Invalid process supplied`};
        }

        if (!args.samples || !_.isArray(args.samples)) {
            return {error: `Invalid samples supplied`};
        }

        for (let sampleId in args.samples) {
            if (!_.isString(sampleId)) {
                return {error: `Invalid sample`};
            }
        }

        return yield validateSamples(projectId, experimentId, args.samples);
    }

    function* validateSamples(projectId, experimentId, sampleIds) {
        let isInProject = yield experiments.experimentExistsInProject(projectId, experimentId);
        if (!isInProject) {
            return {error: `No such experiment`};
        }

        let allSamplesInProject = yield samples.allSamplesInProject(projectId, sampleIds);
        if (!allSamplesInProject) {
            return {error: `Some samples are not in project`};
        }

        let allSamplesInExperiment = yield experiments.allSamplesInExperiment(experimentId, sampleIds);
        if (!allSamplesInExperiment) {
            return {error: `Some samples are not in experiment`};
        }

        return null;
    }
};