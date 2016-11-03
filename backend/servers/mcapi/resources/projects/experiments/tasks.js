const experiments = require('../../../db/model/experiments');
const check = require('../../../db/model/check');
const validators = require('./validators');
const status = require('http-status');
const schema = require('../../../schema');
const parse = require('co-body');
const _ = require('lodash');
const ra = require('../../resource-access');
const Router = require('koa-router');

function* getExperimentTask(next) {
    let rv = yield experiments.getTask(this.params.task_id);
    if (rv.error) {
        this.body = rv;
        this.status = status.NOT_FOUND;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* createExperimentTask(next) {
    let taskArgs = yield parse(this);
    schema.prepare(schema.createExperimentTask, taskArgs);
    let errors = yield validateCreateTaskArgs(taskArgs, this.params.task_id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.createTask(this.params.experiment_id, taskArgs, this.reqctx.user.id);
        if (rv.error) {
            this.status = status.NOT_ACCEPTABLE;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateCreateTaskArgs(taskArgs, taskID) {
    let errors = yield schema.validate(schema.createExperimentTask, taskArgs);
    if (errors !== null) {
        return errors;
    }

    if (taskID) {
        taskArgs.parent_id = taskID;
    }

    return null;
}

function* updateExperimentTask(next) {
    let updateTaskArgs = yield parse(this);
    let errors = yield validateUpdateTaskArgs(updateTaskArgs, this.params.experiment_id, this.params.task_id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.updateTask(this.params.task_id, updateTaskArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateUpdateTaskArgs(args, experimentID, taskID) {
    schema.prepare(schema.updateExperimentTask, args);
    let errors = yield schema.validate(schema.updateExperimentTask, args);
    if (errors != null) {
        return errors;
    }

    if (args.parent_id !== '') {
        let parentIdInExperiment = yield check.taskInExperiment(experimentID, args.parent_id);
        if (!parentIdInExperiment) {
            return {error: 'Invalid parent task'};
        }
    }

    if (args.swap) {
        if (!args.swap.task_id) {
            return {error: 'No swap task identified'};
        }

        if (args.swap.task_id === taskID) {
            return {error: 'Cannot swap task with itself'};
        }

        let swapIdExistsInExperiment = yield check.taskInExperiment(experimentID, args.swap.task_id);
        if (!swapIdExistsInExperiment) {
            return {error: 'Invalid swap task'};
        }
    }

    return null;
}

function* deleteExperimentTask(next) {
    let error = yield validateDeleteTask(this.params.task_id);
    if (error != null) {
        this.body = error;
        this.status = status.BAD_REQUEST;
    } else {
        let rv = yield experiments.deleteTask(this.params.experiment_id, this.params.task_id);
        if (rv.error) {
            this.body = rv;
            this.status = status.BAD_REQUEST;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

function* validateDeleteTask(taskID) {
    let isUnused = yield check.taskProcessIsUnused(taskID);
    if (!isUnused) {
        return {error: `Cannot delete task associated with a process that is being used`};
    }

    return null;
}

function* addExperimentTaskTemplate(next) {
    let rv = yield experiments.addTemplateToTask(this.params.project_id, this.params.experiment_id,
        this.params.task_id, this.params.template_id, this.reqctx.user.id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }

    yield next;
}

function* updateExperimentTaskTemplate(next) {
    let updateArgs = yield parse(this);
    let errors = yield validateUpdateExperimentTaskTemplateArgs(updateArgs, this.params);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.updateTaskTemplate(this.params.task_id, this.params.experiment_id, updateArgs.process_id,
            updateArgs.properties, updateArgs.files, updateArgs.samples);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

function* validateUpdateExperimentTaskTemplateArgs(updateArgs, params) {
    if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
        return {error: `Properties attribute isn't an array`};
    }

    let isTemplateForTask = yield check.isTemplateForTask(updateArgs.template_id, params.task_id);
    if (!isTemplateForTask) {
        return {error: `Incorrect template for task; template: ${updateArgs.template_id} task: ${params.task_id}`};
    }

    let template = yield experiments.getTemplate(updateArgs.template_id);

    if (updateArgs.properties) {
        for (let i = 0; i < updateArgs.properties.length; i++) {
            let property = updateArgs.properties[i];
            let errors = yield validateProperty(template, property);
            if (errors !== null) {
                return errors;
            }
        }
    }

    if (updateArgs.files && !_.isArray(updateArgs.files)) {
        return {error: `Files attribute isn't an array`};
    }

    if (updateArgs.files && !updateArgs.process_id) {
        return {error: `Must supply a process when including files`};
    }

    if (updateArgs.files) {
        for (let i = 0; i < updateArgs.files.length; i++) {
            let f = updateArgs.files[i];
            let errors = yield validateFile(params.project_id, f);
            if (errors !== null) {
                return errors;
            }
        }
    }

    if (updateArgs.samples && !_.isArray(updateArgs.samples)) {
        return {error: `Samples attribute isn't an array`};
    }

    if (updateArgs.samples && !updateArgs.process_id) {
        return {error: `Must supply a process when including samples`};
    }

    if (updateArgs.samples) {
        for (let i = 0; i < updateArgs.samples.length; i++) {
            let s = updateArgs.samples[i];
            let errors = yield validators.validateSample(params.project_id, s);
            if (errors !== null) {
                return errors;
            }
        }
    }

    return null;
}

function createResource() {
    const router = new Router();

    router.post('/', createExperimentTask);

    router.use('/:task_id', ra.validateTaskInExperiment);

    router.get('/:task_id', getExperimentTask);
    router.post('/:task_id', createExperimentTask);
    router.put('/:task_id', updateExperimentTask);
    router.put('/:task_id/template', updateExperimentTaskTemplate);
    router.post('/:task_id/template/:template_id', ra.validateTemplateExists, addExperimentTaskTemplate);
    router.delete('/:task_id', deleteExperimentTask);

    return router;
}

module.exports = {
    createResource
};
