const processes = require('../db/model/processes');
const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');

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
        this.body = rv;
    } else {
        let rv = yield processes.createProcessTemplate(template);
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

function createResource() {
    const router = new Router();

    router.get('/', getProcessTemplates);
    router.post('/', createProcessTemplate);

    return router;
}


module.exports = {
    createResource
};
