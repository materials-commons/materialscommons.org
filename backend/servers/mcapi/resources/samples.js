const samples = require('../db/model/samples');
const files = require('../db/model/files');
const schema = require('../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');

function *getAllSamplesForProject(next) {
    let rv = yield samples.getAllSamplesForProject(this.params.project_id);
    if (rv.error) {
        this.throw(status.BAD_REQUEST, rv.error);
    }
    this.body = rv.val;
    this.status = 200;
    yield next;
}

function *getSampleForProject(next) {
    let isIn = yield samples.sampleInProject(this.params.project_id, this.params.sample_id);
    if (!isIn) {
        this.status = status.BAD_REQUEST;
        this.body = {error: `No such sample ${this.params.sample_id} in project ${this.params.project_id}`};
    } else {
        let rv = yield samples.getSample(this.params.sample_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

function* createSamples(next) {
    let createArgs = yield parse(this);
    let errors = yield validateCreateSamplesArgs(this.params.project_id, createArgs);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield samples.createSamples(this.params.project_id, createArgs.process_id, createArgs.samples,
            this.reqctx.user.id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateCreateSamplesArgs(projectId, args) {
    schema.prepare(schema.createSamples, args);
    let errors = yield schema.validate(schema.createSamples, args);
    if (errors !== null) {
        return errors;
    }

    if (args.process_id === "") {
        return {error: 'Unknown process'};
    }

    let isCreateProcessOrSectioningProcee = yield samples.isValidCreateSamplesProcess(projectId, args.process_id);
    if (!isCreateProcessOrSectioningProcee) {
        return {error: `Process isn't one of: a create samples process or a sectioning process`};
    }

    if (args.samples.length === 0) {
        return {error: `No samples to be created`};
    }

    for (let i = 0; i < args.samples.length; i++) {
        let s = args.samples[i];
        if (!isValidSampleArg(s)) {
            return {error: `Bad sample request: ${s}`};
        }

        if (!s.description) {
            s.description = "";
        }
    }

    return null;
}

function isValidSampleArg(sample) {
    return _.has(sample, 'name');
}

function *updateSample(next) {
    yield next;
}

function* updateSamples(next) {
    let updateArgs = yield parse(this);
    let errors = yield validateUpdateSamples(this.params.project_id, updateArgs);
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

function* validateUpdateSamples(projectId, args) {
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
    let allSamplesInProject = yield samples.allSamplesInProject(projectId, sampleIds);

    if (!allSamplesInProject) {
        return {error: `Some samples are not in project`};
    }

    return null;
}

function* addMeasurements(next) {
    let addMeasurementsArgs = yield parse(this);
    schema.prepare(schema.addSamplesMeasurements, addMeasurementsArgs);
    let errors = yield validateAddMeasurements(this.params.project_id, addMeasurementsArgs);
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

function* validateAddMeasurements(projectId, args) {
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

    // Need to validate that the process is in the project.

    let allSampleIds = _.keys(sampleIds);
    let allSamplesInProject = yield samples.allSamplesInProject(projectId, allSampleIds);
    if (!allSamplesInProject) {
        return {error: `Some samples are not in project`};
    }

    return null;
}

function* updateMeasurements(next) {
    let updateMeasurementsArgs = yield parse(this);
    let errors = yield validateUpdateMeasurements(this.params.project_id, updateMeasurementsArgs);
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

function* validateUpdateMeasurements(projectId, args) {
    return yield validateAddMeasurements(projectId, args); // Same as add for now
}

function* updateSampleFiles(next) {
    let updateArgs = yield parse(this);
    let errors = yield validateUpdateSampleFiles(this.params.project_id, updateArgs.files);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield samples.updateSampleFiles(this.params.sample_id, updateArgs.files);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateUpdateSampleFiles(projectId, updateArgs) {
    if (updateArgs.files) {
        for (let i = 0; i < updateArgs.files.length; i++) {
            let f = updateArgs.files[i];
            let errors = yield validateFile(projectId, f);
            if (errors !== null) {
                return errors;
            }
        }
    } else {
        return {error: 'No files specified'};
    }

    return null;
}

function* validateFile(projectId, file) {
    let errors = yield schema.validate(schema.templateCommand, file);
    if (errors !== null) {
        return errors;
    }

    if (file.command !== 'add' && file.command !== 'delete') {
        return {error: `Bad command '${file.command} for file ${file.id}`};
    }

    let fileInProject = files.isInProject(file.id, projectId);
    if (!fileInProject) {
        return {error: `File ${file.id} not in project ${projectId}`};
    }

    return null;
}

module.exports = {
    getAllSamplesForProject,
    getSampleForProject,
    createSamples,
    updateSample,
    updateSamples,
    addMeasurements,
    updateMeasurements,
    updateSampleFiles
};