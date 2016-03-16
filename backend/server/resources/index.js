module.exports = function(model) {
    'use strict';

    const validateProjectAccess = require('./project-access')(model.access);
    const schema = require('../schema')(model);
    const router = require('koa-router')();
    const projects = require('./projects')(model.projects);
    const samples = require('./samples')(model.samples, schema);
    const files = require('./files')(model.files);
    const processes = require('./processes')(model.processes, schema);
    const directories = require('./directories')(model.directories, schema);
    const users = require('./users')(model.users);
    const shares = require('./shares')(model.shares, schema);

    router.get('/projects', projects.all);
    router.put('/projects/:project_id', validateProjectAccess, projects.update);

    router.get('/projects/:project_id/directories', validateProjectAccess, directories.get);
    router.get('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.get);
    router.post('/projects/:project_id/directories', validateProjectAccess, directories.create);
    router.put('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.update);

    router.post('/projects/:project_id/processes', validateProjectAccess, processes.create);
    router.put('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.update);
    router.get('/projects/:project_id/processes', validateProjectAccess, processes.getList);
    router.get('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.get);

    router.post('/projects/:project_id/samples', validateProjectAccess, samples.create);
    router.get('/projects/:project_id/samples', validateProjectAccess, samples.getList);
    router.put('/projects/:project_id/samples/:sample_id', validateProjectAccess, samples.update);

    router.get('/projects/:project_id/files/:file_id', validateProjectAccess, files.get);
    router.get('/projects/:project_id/files/:file_id/versions', validateProjectAccess, files.getVersions);
    router.put('/projects/:project_id/files/:file_id', validateProjectAccess, files.update);
    router.post('/projects/:project_id/files', validateProjectAccess, files.getList);
    router.delete('/projects/:project_id/files/:file_id', validateProjectAccess, files.deleteFile);
    router.put('/projects/:project_id/files_by_path', validateProjectAccess, files.byPath);

    router.get('/projects/:project_id/shares', validateProjectAccess, shares.getList);
    router.post('/projects/:project_id/shares', validateProjectAccess, shares.create);
    router.delete('/projects/:project_id/shares/:share_id', validateProjectAccess, shares.remove);

    router.put('/users/:project_id', users.update);

    return router;
};
