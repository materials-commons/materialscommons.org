module.exports = function(model) {
    'use strict';

    let validateProjectAccess = require('./project-access')(model.access);
    let schema = require('.././schema')(model);
    let router = require('koa-router')();
    let projects = require('./projects')(model.projects);
    let samples = require('./samples')(model.samples, schema);
    let processes = require('./processes')(model.processes, schema);

    router.get('/projects2', projects.all);
    router.post('/projects2/:project_id/processes', validateProjectAccess, processes.create);
    router.post('/projects2/:project_id/samples', validateProjectAccess, samples.create);
    router.put('/projects2/:project_id/samples/:sample_id', validateProjectAccess, samples.update);

    return router;
};
