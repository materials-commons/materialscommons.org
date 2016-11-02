const samples = require('../../db/model/samples');
const experiments = require('../../db/model/experiments');
const check = require('../../db/model/check');
const schema = require('../../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const ra = require('../resource-access');

function* addSamplesToExperiment(next) {
    let addArgs = yield parse(this);
    let errors = yield validateAddSamples(this.params.project_id, addArgs);
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

function* validateAddSamples(projectId, addArgs) {
    if (!validAddSampleArgs(addArgs)) {
        return {error: `Badly formed list of samples`};
    }

    let allSamplesInProject = yield check.allSamplesInProject(projectId, addArgs.samples);
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
    let allSamplesInProject = yield check.allSamplesInProject(projectId, sampleIds);
    if (!allSamplesInProject) {
        return {error: `Some samples are not in project`};
    }

    let allSamplesInExperiment = yield check.allSamplesInExperiment(experimentId, sampleIds);
    if (!allSamplesInExperiment) {
        return {error: `Some samples are not in experiment`};
    }

    return null;
}

function* addSamplesMeasurements(next) {
    let addMeasurementsArgs = yield parse(this);
    schema.prepare(schema.addSamplesMeasurements, addMeasurementsArgs);
    let errors = yield validateAddSamplesMeasurements(this.params.project_id, addMeasurementsArgs);
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

function* validateAddSamplesMeasurements(projectId, args) {
    let errors = yield schema.validate(schema.addSamplesMeasurements, args);
    if (errors !== null) {
        return errors;
    }

    let sampleIds = {};

    for (let i = 0; i < args.properties.length; i++) {
        let prop = args.properties[i];
        schema.prepare(schema.samplesMeasurement, prop);
        let e = yield schema.validate(schema.samplesMeasurement, prop);
        if (e !== null) {
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
                return e;
            }
            // Need to validate each of the measurement types... (that will be a bit of work)
        }
    }

    let allSampleIds = _.keys(sampleIds);
    let allSamplesInProject = yield check.allSamplesInProject(projectId, allSampleIds);
    if (!allSamplesInProject) {
        return {error: `Some samples are not in project`};
    }

    return null;
}

function* updateSamplesMeasurements(next) {
    let updateMeasurementsArgs = yield parse(this);
    let errors = yield validateUpdateSamplesMeasurements(this.params.project_id, updateMeasurementsArgs);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield samples.updateSamplesMeasurements(updateMeasurementsArgs.properties);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateUpdateSamplesMeasurements(projectId, args) {
    return yield validateAddSamplesMeasurements(projectId, args); // Same as add for now
}

function* getSamplesForExperiment(next) {
    let rv = yield samples.getAllSamplesForExperiment(this.params.experiment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function createRoutes(router) {
    router.post('/projects/:project_id/experiments/:experiment_id/samples',
        ra.validateProjectAccess, ra.validateExperimentInProject, addSamplesToExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id/samples',
        ra.validateProjectAccess, ra.validateExperimentInProject, updateExperimentSamples);
    router.get('/projects/:project_id/experiments/:experiment_id/samples',
        ra.validateProjectAccess, ra.validateExperimentInProject, getSamplesForExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/delete',
        ra.validateProjectAccess, ra.validateExperimentInProject, deleteSamplesFromExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/measurements',
        ra.validateProjectAccess, ra.validateExperimentInProject, addSamplesMeasurements);
    router.put('/projects/:project_id/experiments/:experiment_id/samples/measurements',
        ra.validateProjectAccess, ra.validateExperimentInProject, updateSamplesMeasurements);
}

module.exports = {
    createRoutes
};