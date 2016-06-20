module.exports = function(samples, experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        addSamplesToExperiment,
        updateExperimentSamples,
        deleteSamplesFromExperiment,
        addSamplesMeasurements,
        updateSamplesMeasurements
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

        // Only support updating names at the moment
        for (let i = 0; i < args.samples.length; i++) {
            let s = args.samples[i];
            if (!s.id || !s.name) {
                return {error: `Invalid sample entry ${s}`};
            }
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

    function* addSamplesMeasurements(next) {
        let addMeasurementsArgs = yield parse(this);
        schema.prepare(schema.addSamplesMeasurements, addMeasurementsArgs);
        let errors = yield validateAddSamplesMeasurements(this.params.project_id, this.params.experiment_id, addMeasurementsArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield samples.addSamplesMeasurements(addMeasurementsArgs.properties);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateAddSamplesMeasurements(projectId, experimentId, args) {
        console.log('validateAddSamplesMeasurements', args);
        let errors = yield schema.validate(schema.addSamplesMeasurements, args);
        if (errors !== null) {
            console.log('  errors 1', errors);
            return errors;
        }

        let sampleIds = {};

        for (let i = 0; i < args.properties.length; i++) {
            let prop = args.properties[i];
            schema.prepare(schema.samplesMeasurement, prop);
            let e = yield schema.validate(schema.samplesMeasurement, prop);
            if (e !== null) {
                console.log('  errors 2', e);
                return e;
            }

            for (let s = 0; s < prop.samples.length; s++) {
                sampleIds[prop.samples[s].id] = true;
            }

            for (let j = 0; j < prop.measurements.length; j++) {
                let measurement = prop.measurements[j];
                schema.prepare(schema.measurement, measurement);
                e = yield schema.validate(schema.measurement, measurement);
                if (e !== null) {
                    console.log('  errors 3', e);
                    return e;
                }
                // Need to validate each of the measurement types... (that will be a bit of work)
            }
        }

        // Need to validate that the process is in the project.

        let isInProject = yield experiments.experimentExistsInProject(projectId, experimentId);
        if (!isInProject) {
            console.log('  !isInProject');
            return {error: `No such experiment`};
        }
        let allSampleIds = _.keys(sampleIds);
        let allSamplesInProject = yield samples.allSamplesInProject(projectId, allSampleIds);
        if (!allSamplesInProject) {
            console.log('  !allSamplesInProject');
            return {error: `Some samples are not in project`};
        }

        return null;
    }

    function* updateSamplesMeasurements(next) {
        let updateMeasurementsArgs = yield parse(this);
        let errors = yield validateUpdateSamplesMeasurements(this.params.project_id, this.params.experiment_id, updateMeasurementsArgs);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.updateSamplesMeasurements(this.params.experiment_id, updateMeasurementsArgs.process_id,
                updateMeasurementsArgs.samples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateSamplesMeasurements() {
        return null;
    }
};