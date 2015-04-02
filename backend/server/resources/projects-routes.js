module.exports = function(model, schema, validateAccess) {
    'use strict';

    let router = require('koa-router')();
    let projects = require('./projects')(model.projects);
    let samples = require('./samples')(model.samples, schema);
    router.get('/projects', projects.all);
    router.post('/projects/:project_id/samples', validateAccess, samples.create);
    router.put('/projects/:project_id/samples/:sample_id', validateAccess, samples.update);
    return router;
};
