const ra = require('./resource-access');
const schema = require('../schema');
const router = require('koa-router')();
const projects = require('./projects');
const samples = require('./samples');
const files = require('./files');
const processes = require('./processes');
const directories = require('./directories');
const users = require('./users');
const shares = require('./shares');
const experiments = require('./experiments');
const experimentSamples = require('./experiment-samples');
const experimentDatasets = require('./experiment-datasets');

function create() {
    router.get('/projects', projects.all);
    router.put('/projects/:project_id', ra.validateProjectAccess, projects.update);
    router.get('/projects/:project_id', ra.validateProjectAccess, projects.getProject);

    router.get('/projects/:project_id/directories', ra.validateProjectAccess, directories.get);
    router.get('/projects/:project_id/directories/:directory_id', ra.validateProjectAccess, directories.get);
    router.post('/projects/:project_id/directories', ra.validateProjectAccess, directories.create);
    router.put('/projects/:project_id/directories/:directory_id',
        ra.validateProjectAccess, ra.validateDirectoryInProject, directories.update);
    router.delete('/projects/:project_id/directories/:directory_id',
        ra.validateProjectAccess, ra.validateDirectoryInProject, directories.remove);

    router.get('/projects/:project_id/processes', ra.validateProjectAccess, processes.getProjectProcesses);
    router.get('/projects/:project_id/processes/:process_id', ra.validateProjectAccess, processes.getProcess);
    router.post('/projects/:project_id/processes', ra.validateProjectAccess, processes.createProcessFromTemplate);
    router.put('/projects/:project_id/processes/:process_id', ra.validateProjectAccess, processes.updateProcess);
    router.delete('/projects/:project_id/processes/:process_id', ra.validateProjectAccess, processes.deleteProcess);

    router.get('/templates', processes.getProcessTemplates);

    router.post('/projects/:project_id/samples', ra.validateProjectAccess, samples.createSamples);
    router.get('/projects/:project_id/samples', ra.validateProjectAccess, samples.getAllSamplesForProject);
    router.get('/projects/:project_id/samples/:sample_id', ra.validateProjectAccess, samples.getSampleForProject);
    //router.put('/projects/:project_id/samples/:sample_id', ra.validateProjectAccess, samples.updateSample);
    router.put('/projects/:project_id/samples', ra.validateProjectAccess, samples.updateSamples);
    router.put('/projects/:project_id/samples/:sample_id/files',
        ra.validateProjectAccess, ra.validateSampleInProject, samples.updateSampleFiles);
    router.post('/projects/:project_id/samples/measurements', ra.validateProjectAccess, samples.addMeasurements);
    router.put('/projects/:project_id/samples/measurements', ra.validateProjectAccess, samples.updateMeasurements);

    router.get('/projects/:project_id/files/:file_id', ra.validateProjectAccess, files.get);
    router.get('/projects/:project_id/files/:file_id/versions', ra.validateProjectAccess, files.getVersions);
    router.put('/projects/:project_id/files/:file_id', ra.validateProjectAccess, files.update);
    router.post('/projects/:project_id/files', ra.validateProjectAccess, files.getList);
    router.delete('/projects/:project_id/files/:file_id', ra.validateProjectAccess, files.deleteFile);
    router.put('/projects/:project_id/files_by_path', ra.validateProjectAccess, files.byPath);

    router.get('/projects/:project_id/shares', ra.validateProjectAccess, shares.getList);
    router.post('/projects/:project_id/shares', ra.validateProjectAccess, shares.create);
    router.delete('/projects/:project_id/shares/:share_id', ra.validateProjectAccess, shares.remove);

    router.get('/projects/:project_id/experiments', ra.validateProjectAccess, experiments.getAllExperimentsForProject);
    router.get('/projects/:project_id/experiments/:experiment_id', ra.validateProjectAccess, experiments.getExperiment);

    router.post('/projects/:project_id/experiments', ra.validateProjectAccess, experiments.createExperiment);
    router.delete('/projects/:project_id/experiments/:experiment_id', ra.validateProjectAccess, experiments.deleteExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id', ra.validateProjectAccess, experiments.updateExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', ra.validateProjectAccess, experiments.getExperimentTask);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks', ra.validateProjectAccess, experiments.createExperimentTask);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', ra.validateProjectAccess, experiments.createExperimentTask);
    router.put('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', ra.validateProjectAccess, experiments.updateExperimentTask);
    router.put('/projects/:project_id/experiments/:experiment_id/tasks/:task_id/template', ra.validateProjectAccess, experiments.updateExperimentTaskTemplate);
    router.post('/projects/:project_id/experiments/:experiment_id/tasks/:task_id/template/:template_id', ra.validateProjectAccess, experiments.addExperimentTaskTemplate);
    router.delete('/projects/:project_id/experiments/:experiment_id/tasks/:task_id', ra.validateProjectAccess, experiments.deleteExperimentTask);

    router.get('/projects/:project_id/experiments/:experiment_id/notes', ra.validateProjectAccess, experiments.getNotesForExperiment);
    router.get('/projects/:project_id/experiments/:experiment_id/notes/:note_id', ra.validateProjectAccess, experiments.getExperimentNote);
    router.delete('/projects/:project_id/experiments/:experiment_id/notes/:note_id', ra.validateProjectAccess, experiments.deleteExperimentNote);
    router.put('/projects/:project_id/experiments/:experiment_id/notes/:note_id', ra.validateProjectAccess, experiments.updateExperimentNote);
    router.post('/projects/:project_id/experiments/:experiment_id/notes', ra.validateProjectAccess, experiments.createExperimentNote);

    router.post('/projects/:project_id/experiments/:experiment_id/samples', ra.validateProjectAccess, experimentSamples.addSamplesToExperiment);
    router.put('/projects/:project_id/experiments/:experiment_id/samples', ra.validateProjectAccess, experimentSamples.updateExperimentSamples);
    router.get('/projects/:project_id/experiments/:experiment_id/samples', ra.validateProjectAccess, experimentSamples.getSamplesForExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/delete', ra.validateProjectAccess, experimentSamples.deleteSamplesFromExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/samples/measurements', ra.validateProjectAccess, experimentSamples.addSamplesMeasurements);
    router.put('/projects/:project_id/experiments/:experiment_id/samples/measurements', ra.validateProjectAccess, experimentSamples.updateSamplesMeasurements);

    router.get('/projects/:project_id/experiments/:experiment_id/processes', ra.validateProjectAccess, experiments.getProcessesForExperiment);
    router.post('/projects/:project_id/experiments/:experiment_id/processes/templates/:template_id', ra.validateProjectAccess,
        ra.validateExperimentInProject, experiments.createProcessInExperimentFromTemplate);
    router.put('/projects/:project_id/experiments/:experiment_id/processes/:process_id', ra.validateProjectAccess, experiments.updateExperimentProcess);
    router.get('/projects/:project_id/experiments/:experiment_id/processes/:process_id', ra.validateProjectAccess,
        ra.validateExperimentInProject, ra.validateProcessInExperiment, processes.getProcess);

    router.get('/projects/:project_id/experiments/:experiment_id/files', ra.validateProjectAccess, experiments.getFilesForExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets',
        ra.validateProjectAccess, ra.validateExperimentInProject, experimentDatasets.getDatasetsForExperiment);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.getDatasetForExperiment);

    router.post('/projects/:project_id/experiments/:experiment_id/datasets',
        ra.validateProjectAccess, ra.validateExperimentInProject,
        ra.validateProjectAccess, ra.validateExperimentInProject, experimentDatasets.createDatasetForExperiment);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.updateDatasetForExperiment);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/publish',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.publishDataset);
    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/unpublish',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.unpublishDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples/:sample_id',
        ra.validateProjectAccess, ra.validateExperimentInProject,
        ra.validateDatasetInExperiment, ra.validateSampleInExperiment, experimentDatasets.addSampleToDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.updateSamplesInDataset);

    router.get('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/samples',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.getSamplesForDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/files',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.updateFilesInDataset);

    router.put('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id/processes',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.updateProcessesInDataset);

    router.delete('/projects/:project_id/experiments/:experiment_id/datasets/:dataset_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateDatasetInExperiment,
        experimentDatasets.deleteDatasetFromExperiment);

    router.put('/users/:project_id', users.updateProjectFavorites);
    router.put('/users', users.updateUserSettings);
    router.get('/users/validate/:validation_id', users.getUserRegistrationFromUuid);
    router.get('/users/rvalidate/:validation_id', users.getUserForPasswordResetFromUuid);
    router.put('/users/:user_id/clear-reset-password', users.clearUserResetPasswordFlag);
    router.post('/accounts', users.createAccount);
    router.post('/accounts/reset', users.resetPasswordGenerateLink);

    return router;
}

module.exports.create = create;

