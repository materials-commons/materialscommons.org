const experiments = require('../../../db/model/experiments');
const processes = require('../../../db/model/processes');
const check = require('../../../db/model/check');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const validators = require('./validators');
const ra = require('../../resource-access');
const Router = require('koa-router');

function* getProcessesForExperiment(next) {
    let simple = !!this.query.simple;
    let rv = yield experiments.getProcessesForExperiment(this.params.experiment_id, simple);
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
    updateArgs = convertPropertyDateValues(updateArgs);
    let errors = yield validateUpdateExperimentProcessTemplateArgs(updateArgs, this.params);
    if (errors !== null) {
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
            let errors = yield validators.validateProperty(template, property);
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
            let errors = yield validators.validateFile(params.project_id, f);
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

function convertPropertyDateValues(updateArgs) {
    if (updateArgs.properties) {
        let props = updateArgs.properties;
        for (let i = 0; i < props.length; i++) {
            let property = props[i];
            if (property.otype === 'date') {
                try {
                    property.value = new Date(property.value);
                } catch (e) {
                }
            }
        }
    }
    return updateArgs;
}

function* addAdditionalParemeters(next) {
    let parameterArgs = yield parse(this);
    let properties = parameterArgs.properties;
    let rv = yield processes.addAdditionalParemeters(this.params.process_id, properties);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* cloneProcess(next) {
    let cloneArgs = yield parse(this);
    cloneArgs = setDefaultCloneArgValues(cloneArgs);
    let errors = yield validateCloneArgs(this.params.project_id, cloneArgs);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.cloneProcess(this.params.project_id,
            this.params.experiment_id, this.params.process_id, this.reqctx.user.id, cloneArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

function setDefaultCloneArgValues(cloneArgs) {
    if (!cloneArgs.samples) {
        cloneArgs.samples = [];
    }

    if (!cloneArgs.files) {
        cloneArgs.files = [];
    }

    return cloneArgs;
}

function* validateCloneArgs(projectId, cloneArgs) {
    if (cloneArgs.samples.length) {
        let sampleIds = cloneArgs.samples.map(s => s.sample_id);
        let samplesInProject = yield check.allSamplesInProject(projectId, sampleIds);
        if (!samplesInProject) {
            return {error: `All input samples must be from the project`};
        }
    }

    if (cloneArgs.files.length) {
        let fileIds = cloneArgs.files.map(f => f.id);
        let filesInProject = yield check.allFilesInProject(projectId, fileIds);
        if (!filesInProject) {
            return {error: `All files must be from the project`};
        }
    }

    return null;
}

function* deleteProcessFromExperiment(next) {
    let errors = yield validateProcessIsDeletable(this.params.process_id);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield experiments.quickDeleteExperimentProcess(this.params.project_id, this.params.experiment_id, this.params.process_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateProcessIsDeletable(processId) {
    let isLeafNode = yield processes.isLeafNode(processId);
    if (!isLeafNode) {
        return {error: `Process ${processId} is not a leaf node`};
    }

    if (yield check.processInPublishedDataset(processId)) {
        return {error: `Process in published dataset`};
    }

    return null;
}

function* getProcessFiles(next) {
    let rv = yield processes.processFiles(this.params.process_id);
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

    router.get('/', getProcessesForExperiment);
    router.post('/templates/:template_id', ra.validateTemplateExists, createProcessInExperimentFromTemplate);

    router.use('/:process_id', ra.validateProcessInExperiment);

    router.put('/:process_id', updateExperimentProcess);
    router.get('/:process_id', getProcess);
    router.post('/:process_id/addparameters', addAdditionalParemeters);
    router.post('/:process_id/clone', cloneProcess);
    router.get('/:process_id/files', getProcessFiles);
    router.delete('/:process_id', deleteProcessFromExperiment);

    return router;
}

module.exports = {
    createResource,
    validateUpdateExperimentProcessTemplateArgs //used by build-demo-project-helper
};
