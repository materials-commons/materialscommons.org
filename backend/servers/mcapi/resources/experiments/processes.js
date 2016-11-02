const experiments = require('../../db/model/experiments');
const processes = require('../../db/model/processes');
const check = require('../../db/model/check');
const schema = require('../../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const propertyValidator = require('../../schema/property-validator');
const validators = require('./validators');
const ra = require('../resource-access');

function *getProcessesForExperiment(next) {
    let rv = yield experiments.getProcessesForExperiment(this.params.experiment_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* createProcessInExperimentFromTemplate(next) {
    let rv = yield experiments.addProcessFromTemplate(this.params.project_id, this.params.experiment_id,
        this.params.template_id, this.reqctx.user.id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* updateExperimentProcess(next) {
    let updateArgs = yield parse(this);
    updateArgs.process_id = this.params.process_id;
    let errors = yield validateUpdateExperimentProcessTemplateArgs(updateArgs, this.params);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.updateProcess(this.params.experiment_id, this.params.process_id,
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

function* validateUpdateExperimentProcessTemplateArgs(updateArgs, params) {
    if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
        return {error: `Properties attribute isn't an array`};
    }

    if (updateArgs.process_id) {
        let isTemplateForProcess = yield check.isTemplateForProcess(updateArgs.template_id, updateArgs.process_id);
        if (!isTemplateForProcess) {
            return {error: `Incorrect template for process; template: ${updateArgs.template_id} process: ${params.process_id}`};
        }
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

function* validateProperty(template, property) {
    let errors = yield schema.validate(schema.templateProperty, property);
    if (errors !== null) {
        return errors;
    }

    if (!propertyValidator.isValidSetupProperty(template, property)) {
        return {error: `Invalid property ${property.attribute}`};
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

    let fileInProject = yield check.fileInProject(file.id, projectId);
    if (!fileInProject) {
        return {error: `File ${file.id} not in project ${projectId}`};
    }

    return null;
}

function* getProcess(next) {
    let rv = yield processes.getProcess(this.params.process_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function createRoutes(router) {
    router.get('/projects/:project_id/experiments/:experiment_id/processes',
        ra.validateProjectAccess, ra.validateExperimentInProject, getProcessesForExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/processes/templates/:template_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateTemplateExists,
        createProcessInExperimentFromTemplate);
    router.put('/projects/:project_id/experiments/:experiment_id/processes/:process_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateProcessInExperiment,
        updateExperimentProcess);
    router.get('/projects/:project_id/experiments/:experiment_id/processes/:process_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateProcessInExperiment,
        getProcess);
}

module.exports = {
    createRoutes
};
