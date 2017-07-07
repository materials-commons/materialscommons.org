const router = require('koa-router')();
const projects = require('./projects');
const users = require('./users');
const templates = require('./templates');

function createResources() {
    let projectsResource = projects.createResource();
    router.use('/projects', projectsResource.routes(), projectsResource.allowedMethods());

    let templatesResource = templates.createResource();
    router.use('/templates', templatesResource.routes(), templatesResource.allowedMethods());

    users.createResource(router);

    return router;
}

module.exports = {
    createResources
};

