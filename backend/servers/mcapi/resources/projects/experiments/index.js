const experiments = require('../../../db/model/experiments');
const experimentDelete = require('../../../db/model/experiment-delete');
const check = require('../../../db/model/check');
const schema = require('../../../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const ra = require('../../resource-access');
const Router = require('koa-router');
const datasets = require('./datasets');
const notes = require('./notes');
const samples = require('./samples');
const processes = require('./processes');
const tasks = require('./tasks');

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

function* mergeExperiments(next) {
    let mergeArgs = yield parse(this);
    let errors = yield validateMergeExperimentsArgs(mergeArgs, this.params.project_id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.merge(this.params.project_id, mergeArgs, this.reqctx.user.id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateMergeExperimentsArgs(mergeArgs, projectId) {
    if (!_.isArray(mergeArgs.experiments)) {
        return {error: `${mergeArgs.experiments} is not an array of experiment ids`};
    }

    if (!_.isString(mergeArgs.name) && _.toLength(mergeArgs.name) !== 0) {
        return {error: `Invalid experiment name ${mergeArgs.name}`}
    }

    if (!_.isString(mergeArgs.description)) {
        return {error: `Invalid experiment description`};
    }

    let allExperimentsInProject = yield check.allExperimentsInProject(projectId, mergeArgs.experiments);
    return allExperimentsInProject ? null : {error: `Some experiments are unknown`};
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
    let project_id = this.params.project_id;
    let experiment_id = this.params.experiment_id;
    let options = {
        dryRun: false,
        deleteProcesses: false
    };
    let rv = yield experimentDelete.quickExperimentDelete(project_id, experiment_id, options);
    if (rv.error) {
        this.status = status.NOT_ACCEPTABLE;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* deleteExperimentFully(next) {
    let project_id = this.params.project_id;
    let experiment_id = this.params.experiment_id;
    let options = {
        dryRun: false,
        deleteProcesses: true
    };
    let rv = yield experimentDelete.fullExperimentDelete(project_id, experiment_id, options);
    if (rv.error) {
        this.status = status.NOT_ACCEPTABLE;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* deleteExperimentDryRun(next) {
    let project_id = this.params.project_id;
    let experiment_id = this.params.experiment_id;
    let options = {
        dryRun: true,
        deleteProcesses: true
    };
    let rv = yield experimentDelete.deleteExperiment(project_id, experiment_id, options);
    if (rv.error) {
        this.status = status.NOT_ACCEPTABLE;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* deleteExperiments(next) {
    let deleteArgs = yield parse(this);
    let options = {
        dryRun: false,
        deleteProcesses: true
    };

    let estatus, errors = [], lastVal;

    let e = yield validateDeleteExperimentsArgs(deleteArgs, this.params.project_id);
    if (e != null) {
        this.status = status.BAD_REQUEST;
        this.body = e;
    } else {
        for (let i = 0; i < deleteArgs.experiments.length; i++) {
            let experimentId = deleteArgs.experiments[i];
            let rv = yield experimentDelete.deleteExperiment(this.params.project_id, experimentId, options);
            if (rv.error) {
                estatus = status.NOT_ACCEPTABLE;
                errors.push(rv.error);
            } else {
                lastVal = rv.val;
            }
        }
    }

    if (estatus === status.NOT_ACCEPTABLE) {
        this.status = estatus;
        this.body = errors;
    } else {
        this.body = lastVal;
    }

    yield next;
}

function* validateDeleteExperimentsArgs(deleteArgs, projectId) {
    if (!_.isArray(deleteArgs.experiments)) {
        return {error: `${deleteArgs.experiments} is not an array of experiment ids`};
    }

    let allExperimentsInProject = yield check.allExperimentsInProject(projectId, deleteArgs.experiments);
    return allExperimentsInProject ? null : {error: `Some experiments are unknown`};
}

function* getFilesForExperiment(next) {
    let rv = yield experiments.getFilesForExperiment(this.params.experiment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function createResource() {
    const router = new Router();
    router.get('/', getAllExperimentsForProject);
    router.post('/', createExperiment);
    router.post('/merge', mergeExperiments);
    router.post('/delete', deleteExperiments);

    router.use('/:experiment_id', ra.validateExperimentInProject);

    router.get('/:experiment_id', getExperiment);
    router.delete('/:experiment_id', ra.validateExperimentOwner, deleteExperiment);
    router.put('/:experiment_id', updateExperiment);
    router.get('/:experiment_id/files', getFilesForExperiment);
    router.get('/:experiment_id/delete/dryrun', ra.validateExperimentOwner, deleteExperimentDryRun);
    router.delete('/:experiment_id/delete/fully', ra.validateExperimentOwner, deleteExperimentFully);

    let datasetsResource = datasets.createResource();
    router.use('/:experiment_id/datasets', datasetsResource.routes(), datasetsResource.allowedMethods());

    let notesResource = notes.createResource();
    router.use('/:experiment_id/notes', notesResource.routes(), notesResource.allowedMethods());

    let processesResource = processes.createResource();
    router.use('/:experiment_id/processes', processesResource.routes(), processesResource.allowedMethods());

    let samplesResource = samples.createResource();
    router.use('/:experiment_id/samples', samplesResource.routes(), samplesResource.allowedMethods());

    let tasksResource = tasks.createResource();
    router.use('/:experiment_id/tasks', tasksResource.routes(), tasksResource.allowedMethods());

    return router;
}

module.exports = {
    createResource
};