const router = require('koa-router')();
const projects = require('./projects');
const users = require('./users');

function createResources() {
    projects.createResources(router);
    users.createResources(router);
    return router;
}

module.exports = {
    createResources
};

