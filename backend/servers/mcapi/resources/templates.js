const processes = require('../db/model/processes');
const status = require('http-status');
const Router = require('koa-router');

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

function createResource() {
    const router = new Router();

    router.get('/', getProcessTemplates);

    return router;
}


module.exports = {
    createResource
};
