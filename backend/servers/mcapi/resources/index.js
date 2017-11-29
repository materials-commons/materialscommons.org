const router = require('koa-router')();
const projects = require('./projects');
const comments = require('./comments');
const users = require('./users');
const templates = require('./templates');
const files = require('./files');

function createResources() {
    let projectsResource = projects.createResource();
    router.use('/projects', projectsResource.routes(), projectsResource.allowedMethods());

    let commentsResource = comments.createResource();
    router.use('/comments', commentsResource.routes(), commentsResource.allowedMethods());

    let templatesResource = templates.createResource();
    router.use('/templates', templatesResource.routes(), templatesResource.allowedMethods());

    let filesResource = files.createResource();
    router.use('/files', filesResource.routes(), filesResource.allowedMethods());

    users.createResource(router);

    return router;
}

module.exports = {
    createResources
};

