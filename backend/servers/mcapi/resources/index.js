const router = require('koa-router')();
const projects = require('./projects');
const users = require('./users');

function createResources() {
    let projectsResource = projects.createResource();
    router.use('/projects', projectsResource.routes(), projectsResource.allowedMethods());
    users.createResource(router);
    return router;
}

module.exports = {
    createResources
};

