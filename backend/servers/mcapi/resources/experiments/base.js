const experiments = require('../../db/model/experiments');
const check = require('../../db/model/check');
const schema = require('../../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const ra = require('../resource-access');

function* getAllExperimentsForProject(next) {
    let rv = yield experiments.getAllForProject(this.params.project_id);
    if (rv.error) {
        this.body = rv;
        this.status = status.NOT_FOUND;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* getExperiment(next) {
    let rv = yield experiments.get(this.params.experiment_id);
    if (rv.error) {
        this.body = rv;
        this.status = status.NOT_FOUND;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* updateExperiment(next) {
    let updateArgs = yield parse(this);
    let errors = yield validateUpdateExperimentArgs(updateArgs, this.params.project_id, this.params.experiment_id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.update(this.params.experiment_id, updateArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateUpdateExperimentArgs(experimentArgs, projectID, experimentID) {
    schema.prepare(schema.updateExperiment, experimentArgs);
    let errors = yield schema.validate(schema.updateExperiment, experimentArgs);
    if (errors != null) {
        return errors;
    }
    for (let prop in experimentArgs) {
        if (prop !== 'name' || prop !== 'description' || prop !== 'note') {
            if (!allEntriesAreStrings(experimentArgs[prop])) {
                return {error: `${prop} entries must all be of type string`};
            }
        }

        if (prop === 'status') {
            let status = experimentArgs.status;
            if (status !== 'active' && status !== 'done' && status !== 'on-hold') {
                return {error: `Invalid experiment status ${status}`};
            }
        }
    }

    let isInProject = yield check.experimentExistsInProject(projectID, experimentID);
    return isInProject ? null : {error: 'No such experiment'};
}

function allEntriesAreStrings(items) {
    for (let item in items) {
        if (!_.isString(item)) {
            return false;
        }
    }

    return true;
}

function* createExperiment(next) {
    let experimentArgs = yield parse(this);
    schema.prepare(schema.createExperiment, experimentArgs);
    experimentArgs.project_id = this.params.project_id;
    let errors = yield schema.validate(schema.createExperiment, experimentArgs);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.create(experimentArgs, this.reqctx.user.id);
        if (rv.error) {
            this.status = status.NOT_ACCEPTABLE;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* deleteExperiment(next) {
    yield next;
}

function *getFilesForExperiment(next) {
    let rv = yield experiments.getFilesForExperiment(this.params.experiment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function createRoutes(router) {
    router.get('/projects/:project_id/experiments', ra.validateProjectAccess,
        getAllExperimentsForProject);
    router.get('/projects/:project_id/experiments/:experiment_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, getExperiment);
    router.post('/projects/:project_id/experiments', ra.validateProjectAccess, createExperiment);
    router.delete('/projects/:project_id/experiments/:experiment_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, deleteExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, updateExperiment);
    router.get('/projects/:project_id/experiments/:experiment_id/files',
        ra.validateProjectAccess, ra.validateExperimentInProject, getFilesForExperiment);
}

module.exports = {
    createRoutes
};
