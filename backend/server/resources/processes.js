module.exports = function (processes, schema) {
    const status = require('http-status');
    const parse = require('co-body');
    const _ = require('lodash');

    return {
        getProcess,
        getProjectProcesses,
        getProcessTemplates,
        createProcessFromTemplate
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
};
