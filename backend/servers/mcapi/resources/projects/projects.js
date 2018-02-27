const projects = require('../../db/model/projects');
const projectDelete = require('../../db/model/project-delete');
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
const activityFeed = require('../../db/model/activity-feed');
const shortcuts = require('./shortcuts');

function* create(next) {
    let user = this.reqctx.user;
    let attrs = yield parse(this);
    let rv = yield projects.createProject(user, attrs);
    if (rv.error) {
        this.status = status.BAD_REQUEST;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function* all(next) {
    let user = this.reqctx.user;
    if (this.query.simple) {
        this.body = yield projects.forUserSimple(user);
    } else {
        this.body = yield projects.forUser(user);
    }
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

function* deleteProject(next) {
    yield projectDelete.quickProjectDelete(this.params.project_id);
    this.body = {project_id: this.params.project_id}
    yield next;
}

function* deleteProjectFull(next) {
    let options = {
        dryRun: false
    };
    let rv = yield projectDelete.deleteProject(this.params.project_id, options);
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

function* getUserAccessForProject(next) {
    this.body = yield projects.getUserAccessForProject(this.params.project_id);
    yield next;
}

function* updateUserAccessForProject(next) {
    let attrs = yield parse(this);
    this.body = yield projects.updateUserAccessForProject(this.params.project_id, attrs);
    yield next;
}

function* getProjectActivityFeed(next) {
    this.body = yield activityFeed.getActivityFeedForProject(this.params.project_id);
    yield next;
}

function createResource() {
    const router = new Router();
    router.get('/', all);
    router.post('/', create);
    router.use('/:project_id', ra.validateProjectAccess);
    router.put('/:project_id', update);
    router.get('/:project_id', getProject);
    router.delete('/:project_id', ra.validateProjectOwner, deleteProject);

    router.get('/:project_id/access', ra.validateProjectOwner, getUserAccessForProject);
    router.put('/:project_id/access', ra.validateProjectOwner, updateUserAccessForProject);

    router.get('/:project_id/activity_feed', getProjectActivityFeed);

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

    let shortcutsResource = shortcuts.createResource();
    router.use('/:project_id/shortcuts', shortcutsResource.routes(), shortcutsResource.allowedMethods());

    return router;
}

module.exports = {
    createResource
};
