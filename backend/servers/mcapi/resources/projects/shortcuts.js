const Router = require('koa-router');
const dirs = require('../../db/model/directories');
const status = require('http-status');


function* createShortcut(next) {
    this.body = yield dirs.updateShortcut(this.params.directory_id, true);
    yield next;
}

function* deleteShortcut(next) {
    this.body = yield dirs.updateShortcut(this.params.directory_id, false);
    yield next;
}

function createResource() {
    const router = new Router();

    router.put('/:directory_id', createShortcut);
    router.delete('/:directory_id', deleteShortcut);

    return router;
}

module.exports = {
    createResource
};