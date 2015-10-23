module.exports = function(model) {
    'use strict';

    let validateProjectAccess = require('./project-access')(model.access);
    let schema = require('.././schema')(model);
    let router = require('koa-router')();
    let projects = require('./projects')(model.projects);
    let samples = require('./samples')(model.samples, schema);
    let files = require('./files')(model.files);
    let processes = require('./processes')(model.processes, schema);

    router.get('/projects', projects.all);
    router.get('/projects/:project_id/directories', validateProjectAccess, projects.dirTree);
    router.get('/projects/:project_id/directories/:directory_id', validateProjectAccess, projects.dirTree);

    router.post('/projects/:project_id/processes', validateProjectAccess, processes.create);
    router.put('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.update);
    router.get('/projects/:project_id/processes', validateProjectAccess, processes.getList);
    router.get('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.get);

    router.post('/projects/:project_id/samples', validateProjectAccess, samples.create);
    router.get('/projects/:project_id/samples', validateProjectAccess, samples.allForProject);
    router.put('/projects/:project_id/samples/:sample_id', validateProjectAccess, samples.update);

    router.get('/projects/:project_id/files/:file_id', validateProjectAccess, files.get);
    router.put('/projects/:project_id/files/:file_id', validateProjectAccess, files.update);
    router.post('/projects/:project_id/files', validateProjectAccess, files.getList);
    router.delete('/projects/:project_id/files/:file_id', validateProjectAccess, files.deleteFile);

    return router;
};
