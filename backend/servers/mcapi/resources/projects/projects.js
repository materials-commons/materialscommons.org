const projects = require('../../db/model/projects');
const parse = require('co-body');
const status = require('http-status');
const ra = require('../resource-access');

function* all(next) {
    let user = this.reqctx.user;
    this.body = yield projects.forUser(user);
    yield next;
}

function* getProject(next) {
    let rv = yield projects.getProject(this.params.project_id);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* update(next) {
    let attrs = yield parse(this);
    this.body = yield projects.update(this.params.project_id, attrs);
    yield next;
}

function* dirTree(next) {
    let dirID = this.params.directory_id || 'top';
    this.body = yield projects.dirTree(this.params.project_id, dirID);
    yield next;
}

function createResources(router) {
    router.get('/projects', all);
    router.put('/projects/:project_id', ra.validateProjectAccess, update);
    router.get('/projects/:project_id', ra.validateProjectAccess, getProject);
}

module.exports = {
    createResources
};
