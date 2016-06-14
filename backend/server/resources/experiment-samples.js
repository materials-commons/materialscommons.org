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
            let rv = experiments.addSamples(this.params.experiment_id, addArgs);
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
        console.log('validAddSampleArgs', args);
        if (!args.samples || !_.isArray(args.samples)) {
            console.log('failed 1');
            return false;
        }

        for (let sample in args.samples) {
            if (!_.isString(sample)) {
                console.log('sample is not a string', sample);
                return false;
            }
        }

        return true;
    }

    function* updateExperimentSamples(next) {
        yield next;
    }

    function* deleteSamplesFromExperiment(next) {
        yield next;
    }
};