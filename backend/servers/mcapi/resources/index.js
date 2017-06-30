const router = require('koa-router')();
const projects = require('./projects');
const users = require('./users');
const templates = require('./templates');
const profiles = require('./user_profiles');

function createResources() {
    let projectsResource = projects.createResource();
    router.use('/projects', projectsResource.routes(), projectsResource.allowedMethods());

    let templatesResource = templates.createResource();
    router.use('/templates', templatesResource.routes(), templatesResource.allowedMethods());

    let templatesResource = templates.createResource();
    router.use('/profiles', templatesResource.routes(), profiles.allowedMethods());

    users.createResource(router);

    return router;
}

module.exports = {
    createResources
};

