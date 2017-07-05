const processes = require('../db/model/processes');
const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');

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

function* createProcessTemplate(next) {
    let template = yield parse(this);
    let errors = yield validateTemplate(template);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield processes.createProcessTemplate(template, this.reqctx.user.id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateTemplate(template) {
    template.id = `global_${template.name}`;
    let t = yield processes.getTemplate(template.id);
    if (t !== null) {
        return {errors: `Template already exists`};
    }

    return null;
}

function* updateProcessTemplate(next) {
    let template = yield parse(this);
    let template_id = this.params.template_id
    let rv = yield processes.updateExistingTemplate(template_id, template);
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

    router.get('/', getProcessTemplates);
    router.post('/', createProcessTemplate);
    router.put('/:template_id', ra.validateTemplateExists, ra.validateTemplateAccess, updateProcessTemplate);

    return router;
}


module.exports = {
    createResource
};
