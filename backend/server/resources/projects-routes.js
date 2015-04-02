module.exports = function(model) {
    'use strict';

    let validateProjectAccess = require('./project-access')(model.access);
    let schema = require('.././schema')(model);
    let router = require('koa-router')();
    let projects = require('./projects')(model.projects);
    let samples = require('./samples')(model.samples, schema);

    router.get('/projects', projects.all);
    router.post('/projects/:project_id/samples', validateProjectAccess, samples.create);
    router.put('/projects/:project_id/samples/:sample_id', validateProjectAccess, samples.update);

    return router;
};
