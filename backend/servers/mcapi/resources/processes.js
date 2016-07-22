module.exports = function(processes, samples, experiments, schema) {
    const status = require('http-status');
    const parse = require('co-body');
    const _ = require('lodash');
    const propertyValidator = require('../schema/property-validator');

    return {
        getProcess,
        getProjectProcesses,
        getProcessTemplates,
        createProcessFromTemplate,
        updateProcess
    };

    /////////////////////////

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

        let found = yield processes.processTemplateExists(templateArgs.template_id);
        if (!found) {
            return {error: `No such template ${templateArgs.template_id}`};
        }

        return null;
    }

    function* updateProcess(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateProcess(updateArgs, this.params);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield processes.updateProcess(this.params.process_id, updateArgs.properties, updateArgs.files, updateArgs.samples);
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
    // common module. Also, the call experiments.fileInProject() has the call in the wrong module. It should be
    // extracted from the experiments module. All there is experiments.getTemplate() and processes.getTemplate()
    // that are exactly the same.

    function* validateUpdateProcess(updateArgs, params) {
        if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
            return {error: `Properties attribute isn't an array`};
        }

        // TODO: Validate that the template is the template originally used for the process.

        let template = yield processes.getTemplate(updateArgs.template_id);

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

        if (updateArgs.samples) {
            for (let i = 0; i < updateArgs.samples.length; i++) {
                let s = updateArgs.samples[i];
                let errors = yield validateSample(params.project_id, s);
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

        let fileInProject = yield experiments.fileInProject(file.id, projectId);
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

        let sampleInProject = yield samples.sampleInProject(projectId, sample.id);
        if (!sampleInProject) {
            return {error: `Sample ${sample.id} not in project ${projectId}`}
        }

        let sampleHasPropertySet = yield samples.sampleHasPropertySet(sample.id, sample.property_set_id);
        if (!sampleHasPropertySet) {
            return {error: `Sample ${sample.id} doesn't have property set ${sample.property_set_id}`};
        }

        return null;
    }

    // =================================================================================================================
};
