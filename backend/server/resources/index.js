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
    const experiments = require('./experiments')(model.experiments, schema);
    const experimentSamples = require('./experiment-samples')(model.samples, schema);

    router.get('/projects', projects.all);
    router.put('/projects/:project_id', validateProjectAccess, projects.update);

    router.get('/projects/:project_id/directories', validateProjectAccess, directories.get);
    router.get('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.get);
    router.post('/projects/:project_id/directories', validateProjectAccess, directories.create);
    router.put('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.update);
    router.delete('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.remove);

    router.post('/projects/:project_id/processes', validateProjectAccess, processes.create);
    router.put('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.update);
    router.get('/projects/:project_id/processes', validateProjectAccess, processes.getList);
    router.get('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.get);

    router.post('/projects/:project_id/samples', validateProjectAccess, samples.createSamples);
    router.get('/projects/:project_id/samples', validateProjectAccess, samples.getAllSamplesForProject);
    router.get('/projects/:project_id/samples/:sample_id', validateProjectAccess, samples.getSampleForProject);
    router.put('/projects/:project_id/samples/:sample_id', validateProjectAccess, samples.updateSample);
    router.put('/projects/:project_id/samples', validateProjectAccess, samples.updateSamples);

    router.get('/projects/:project_id/files/:file_id', validateProjectAccess, files.get);
    router.get('/projects/:project_id/files/:file_id/versions', validateProjectAccess, files.getVersions);
    router.put('/projects/:project_id/files/:file_id', validateProjectAccess, files.update);
    router.post('/projects/:project_id/files', validateProjectAccess, files.getList);
    router.delete('/projects/:project_id/files/:file_id', validateProjectAccess, files.deleteFile);
    router.put('/projects/:project_id/files_by_path', validateProjectAccess, files.byPath);

    router.get('/projects/:project_id/shares', validateProjectAccess, shares.getList);
    router.post('/projects/:project_id/shares', validateProjectAccess, shares.create);
    router.delete('/projects/:project_id/shares/:share_id', validateProjectAccess, shares.remove);

    router.get('/projects/:project_id/experiments', validateProjectAccess, experiments.getAllExperimentsForProject);
    router.get('/projects/:project_id/experiments/:experiment_id', validateProjectAccess, experiments.getExperiment);

    router.post('/projects/:project_id/experiments', validateProjectAccess, experiments.createExperiment);
    router.delete('/projects/:project_id/experiments/:experiment_id', validateProjectAccess, experiments.deleteExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id', validateProjectAccess, experiments.updateExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', validateProjectAccess, experiments.getExperimentTask);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks', validateProjectAccess, experiments.createExperimentTask);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', validateProjectAccess, experiments.createExperimentTask);
    router.put('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', validateProjectAccess, experiments.updateExperimentTask);
    router.put('/projects/:project_id/experiments/:experiment_id/tasks/:task_id/template', validateProjectAccess, experiments.updateExperimentTaskTemplate);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks/:task_id/template/:template_id', validateProjectAccess, experiments.addExperimentTaskTemplate);
    router.delete('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', validateProjectAccess, experiments.deleteExperimentTask);

    router.get('/projects/:project_id/experiments/:experiment_id/notes', validateProjectAccess, experiments.getNotesForExperiment);
    router.get('/projects/:project_id/experiments/:experiment_id/notes/:note_id', validateProjectAccess, experiments.getExperimentNote);
    router.delete('/projects/:project_id/experiments/:experiment_id/notes/:note_id', validateProjectAccess, experiments.deleteExperimentNote);
    router.put('/projects/:project_id/experiments/:experiment_id/notes/:note_id', validateProjectAccess, experiments.updateExperimentNote);
    router.post('/projects/:project_id/experiments/:experiment_id/notes', validateProjectAccess, experiments.createExperimentNote);

    router.post('/projects/:project_id/experiments/:experiment_id/samples', experimentSamples.addSamplesToExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id/samples/:sample_id',
        experimentSamples.updateExperimentSamples);
    router.delete('/projects/:project_id/experiments/experiment_id/samples/:sample_id',
        experimentSamples.deleteSamplesFromExperiment);

    router.put('/users/:project_id', users.update);

    return router;
};
