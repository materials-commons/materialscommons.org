const samples = require('./samples');
const files = require('./files');
const directories = require('./directories');
const processes = require('./processes');
const shares = require('./shares');
const experiments = require('./experiments');
const projects = require('./projects');
//const Router = require('koa-router');

function createResources(router) {
    projects.createResources(router);
    samples.createResources(router);
    files.createResources(router);
    directories.createResources(router);
    processes.createResources(router);
    shares.createResources(router);
    experiments.createResources(router);
}

module.exports = {
    createResources
};
