const projects = require('../../db/model/projects');
const parse = require('co-body');
const status = require('http-status');
const ra = require('../resource-access');
const Router = require('koa-router');

const samples = require('./samples');
const files = require('./files');
const directories = require('./directories');
const processes = require('./processes');
const shares = require('./shares');
const experiments = require('./experiments');

function* all(next) {
    console.log('calling all');
    let user = this.reqctx.user;
    this.body = yield projects.forUser(user);
    yield next;
}

function* getProject(next) {
    console.log('calling getProject');
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

function createResource() {
    const router = new Router();
    router.get('/', all);
    router.put('/:project_id', ra.validateProjectAccess, update);
    router.get('/:project_id', ra.validateProjectAccess, getProject);

    let samplesResource = samples.createResource();
    router.use('/:project_id/samples', samplesResource.routes(), samplesResource.allowedMethods());

    let filesResource = files.createResource();
    router.use('/:project_id/files', filesResource.routes(), filesResource.allowedMethods());

    let directoriesResource = directories.createResource();
    router.use('/:project_id/directories', directoriesResource.routes(), directoriesResource.allowedMethods());

    let processesResource = processes.createResource();
    router.use('/:project_id/processes', processesResource.routes(), processesResource.allowedMethods());

    let sharesResource = shares.createResource();
    router.use('/:project_id/shares', sharesResource.routes(), sharesResource.allowedMethods());

    let experimentsResource = experiments.createResource();
    router.use('/:project_id/experiments', experimentsResource.routes(), experimentsResource.allowedMethods());

    return router;
}

module.exports = {
    createResource
};
