module.exports = function(model) {
    'use strict';

    const validateProjectAccess = require('./project-access')(model.access);
    const resourceAccess = require('./resource-access')(model.access, model.experiments);
    const schema = require('../schema')(model);
    const router = require('koa-router')();
    const projects = require('./projects')(model.projects);
    const samples = require('./samples')(model.samples, schema);
    const files = require('./files')(model.files);
    const processes = require('./processes')(model.processes, schema);
    const directories = require('./directories')(model.directories, schema);
    const users = require('./users')(model.users, model.experiments, schema);
    const shares = require('./shares')(model.shares, schema);
    const experiments = require('./experiments')(model.experiments, model.samples, schema);
    const experimentSamples = require('./experiment-samples')(model.samples, model.experiments, schema);
    const experimentDatasets = require('./experiment-datasets')(model.experimentDatasets, model.experiments, model.samples, schema);

    router.get('/projects', projects.all);
    router.put('/projects/:project_id', validateProjectAccess, projects.update);

    router.get('/projects/:project_id/directories', validateProjectAccess, directories.get);
    router.get('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.get);
    router.post('/projects/:project_id/directories', validateProjectAccess, directories.create);
    router.put('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.update);
    router.delete('/projects/:project_id/directories/:directory_id', validateProjectAccess, directories.remove);

    router.get('/projects/:project_id/processes', validateProjectAccess, processes.getProjectProcesses);
    router.get('/projects/:project_id/processes/:process_id', validateProjectAccess, processes.getProcess);

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

    router.post('/projects/:project_id/experiments/:experiment_id/samples', validateProjectAccess, experimentSamples.addSamplesToExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id/samples', validateProjectAccess, experimentSamples.updateExperimentSamples);
    router.get('/projects/:project_id/experiments/:experiment_id/samples', validateProjectAccess, experimentSamples.getSamplesForExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/delete', validateProjectAccess, experimentSamples.deleteSamplesFromExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/measurements', validateProjectAccess, experimentSamples.addSamplesMeasurements);
    router.put('/projects/:project_id/experiments/:experiment_id/samples/measurements', validateProjectAccess, experimentSamples.updateSamplesMeasurements);

    router.get('/projects/:project_id/experiments/:experiment_id/processes', validateProjectAccess, experiments.getProcessesForExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/files', validateProjectAccess, experiments.getFilesForExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, experimentDatasets.getDatasetsForExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.getDatasetForExperiment);

    router.post('/projects/:project_id/experiments/:experiment_id/datasets',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject,
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, experimentDatasets.createDatasetForExperiment);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.updateDatasetForExperiment);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.publishDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples/:sample_id',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject,
        resourceAccess.validateDatasetInExperiment, resourceAccess.validateSampleInExperiment, experimentDatasets.addSampleToDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.updateSamplesInDataset);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.getSamplesForDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/files',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.updateFilesInDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/processes',
        resourceAccess.validateProjectAccess, resourceAccess.validateExperimentInProject, resourceAccess.validateDatasetInExperiment,
        experimentDatasets.updateProcessesInDataset);

    router.put('/users/:project_id', users.updateProjectFavorites);
    router.put('/users', users.updateUserSettings);
    router.post('/accounts', users.createAccount);

    return router;
};
