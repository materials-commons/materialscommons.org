const router = require('koa-router')();
const projects = require('./projects');
const samples = require('./samples');
const files = require('./files');
const processes = require('./processes');
const directories = require('./directories');
const users = require('./users');
const shares = require('./shares');
const experiments = require('./experiments');

function createResources() {
    projects.createResources(router);
    directories.createResources(router);
    processes.createResources(router);
    samples.createResources(router);
    files.createResources(router);
    shares.createResources(router);
    experiments.createResources(router);
    users.createResources(router);
    return router;
}

module.exports = {
    createResources
};

