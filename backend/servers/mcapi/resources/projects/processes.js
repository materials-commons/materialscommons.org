const processes = require('../../db/model/processes');
const check = require('../../db/model/check');
const schema = require('../../schema');
const status = require('http-status');
const parse = require('co-body');
const _ = require('lodash');
const propertyValidator = require('../../schema/property-validator');
const ra = require('../resource-access');
const Router = require('koa-router');

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

function* getProjectProcesses(next) {
    let rv = yield processes.getProjectProcesses(this.params.project_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* getProcessTemplates(next) {
    let rv = yield processes.getProcessTemplates();
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* createProcessFromTemplate(next) {
    let templateArgs = yield parse(this);
    let errors = yield validateCreateProcessFromTemplate(templateArgs);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield processes.createProcessFromTemplate(this.params.project_id, templateArgs.template_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateCreateProcessFromTemplate(templateArgs) {
    if (!templateArgs.template_id) {
        return {error: `missing required parameter template_id `};
    }

    if (!_.isString(templateArgs.template_id)) {
        return {error: `template_id must be a string`};
    }

    let found = yield check.templateExists(templateArgs.template_id);
    if (!found) {
        return {error: `No such template ${templateArgs.template_id}`};
    }
    return null;
}

function* deleteProcess(next) {
    let errors = yield validateDeleteProcess(this.params.process_id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield processes.deleteProcess(this.params.project_id, this.params.process_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv;
        }
    }
    yield next;
}

function* validateDeleteProcess(process_id) {
    let datasets = yield processes.datasetsForProcess(process_id);
    if (datasets.length > 0) {
        let datasetNames = datasets.map(ds => ds.title);
        let message = "Process can not be deleted when it is in a dataset; remove from: " + datasetNames.join(", ");
        return {error: message};
    }
    return null;
}

function* updateProcess(next) {
    let updateArgs = yield parse(this);
    schema.prepare(schema.updateProcess, updateArgs);
    let errors = yield validateUpdateProcess(updateArgs, this.params);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield processes.updateProcess(this.params.process_id, updateArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

// =================================================================================================================
// TODO: All the validate code below is shared with resources/experiments.js. It should be moved into a
// common module.

function* validateUpdateProcess(updateArgs, params) {
    let errors = yield schema.validate(schema.updateProcess, updateArgs);
    if (errors !== null) {
        return errors;
    }

    if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
        return {error: `Properties attribute isn't an array`};
    } else if (updateArgs.properties.length) {
        // TODO: Validate that the template is the template originally used for the process.

        if (!updateArgs.template_id || updateArgs.template_id === "") {
            return {error: `A template id must be specified when properties are given`};
        }

        let template = yield processes.getTemplate(updateArgs.template_id);

        if (updateArgs.properties) {
            for (let i = 0; i < updateArgs.properties.length; i++) {
                let property = updateArgs.properties[i];
                errors = yield validateProperty(template, property);
                if (errors !== null) {
                    return errors;
                }
            }
        }
    }

    if (updateArgs.files && !_.isArray(updateArgs.files)) {
        return {error: `Files attribute isn't an array`};
    } else if (updateArgs.files.length) {
        for (let i = 0; i < updateArgs.files.length; i++) {
            let f = updateArgs.files[i];
            errors = yield validateFile(params.project_id, f);
            if (errors !== null) {
                return errors;
            }
        }
    }

    if (updateArgs.samples && !_.isArray(updateArgs.samples)) {
        return {error: `Samples attribute isn't an array`};
    } else if (updateArgs.samples.length) {
        for (let i = 0; i < updateArgs.samples.length; i++) {
            let s = updateArgs.samples[i];
            errors = yield validateSample(params.project_id, s);
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

function* validateSample(projectId, sample) {
    let errors = yield schema.validate(schema.templateCommand, sample);
    if (errors !== null) {
        return errors;
    }

    if (sample.command !== 'add' && sample.command !== 'delete') {
        return {error: `Bad command '${sample.command} for file ${sample.id}`}
    }

    if (sample.property_set_id === '') {
        return {error: `A valid property set must be supplied`};
    }

    let sampleInProject = yield check.sampleInProject(projectId, sample.id);
    if (!sampleInProject) {
        return {error: `Sample ${sample.id} not in project ${projectId}`}
    }

    let sampleHasPropertySet = yield check.sampleHasPropertySet(sample.id, sample.property_set_id);
    if (!sampleHasPropertySet) {
        return {error: `Sample ${sample.id} doesn't have property set ${sample.property_set_id}`};
    }

    return null;
}

function createResource() {
    const router = new Router();

    router.get('/', getProjectProcesses);
    router.post('/', createProcessFromTemplate);
    router.get('/templates', getProcessTemplates);

    router.use('/:process_id', ra.validateProcessInProject);
    router.get('/:process_id', getProcess);
    router.put('/:process_id', updateProcess);
    router.delete('/:process_id', deleteProcess);

    return router;
}

module.exports = {
    createResource
};
