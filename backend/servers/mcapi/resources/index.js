const ra = require('./resource-access');
const router = require('koa-router')();
const projects = require('./projects');
const samples = require('./samples');
const files = require('./files');
const processes = require('./processes');
const directories = require('./directories');
const users = require('./users');
const shares = require('./shares');
const experiments = require('./experiments');


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
    router.get('/projects/:project_id/processes/:process_id',
        ra.validateProjectAccess, ra.validateProcessInProject, processes.getProcess);
    router.post('/projects/:project_id/processes', ra.validateProjectAccess, processes.createProcessFromTemplate);
    router.put('/projects/:project_id/processes/:process_id',
        ra.validateProjectAccess, ra.validateProcessInProject, processes.updateProcess);
    router.delete('/projects/:project_id/processes/:process_id',
        ra.validateProjectAccess, ra.validateProcessInProject, processes.deleteProcess);

    router.get('/templates', processes.getProcessTemplates);

    router.post('/projects/:project_id/samples', ra.validateProjectAccess, samples.createSamples);
    router.get('/projects/:project_id/samples', ra.validateProjectAccess, samples.getAllSamplesForProject);
    router.get('/projects/:project_id/samples/:sample_id',
        ra.validateProjectAccess, ra.validateSampleInProject, samples.getSampleForProject);
    router.put('/projects/:project_id/samples', ra.validateProjectAccess, samples.updateSamples);
    router.put('/projects/:project_id/samples/:sample_id/files',
        ra.validateProjectAccess, ra.validateSampleInProject, samples.updateSampleFiles);
    router.post('/projects/:project_id/samples/measurements', ra.validateProjectAccess, samples.addMeasurements);
    router.put('/projects/:project_id/samples/measurements', ra.validateProjectAccess, samples.updateMeasurements);

    router.get('/projects/:project_id/files/:file_id',
        ra.validateProjectAccess, ra.validateFileInProject, files.get);
    router.get('/projects/:project_id/files/:file_id/versions',
        ra.validateProjectAccess, ra.validateFileInProject, files.getVersions);
    router.put('/projects/:project_id/files/:file_id',
        ra.validateProjectAccess, ra.validateFileInProject, files.update);
    router.post('/projects/:project_id/files', ra.validateProjectAccess, files.getList);
    router.delete('/projects/:project_id/files/:file_id',
        ra.validateProjectAccess, ra.validateFileInProject, files.deleteFile);
    router.put('/projects/:project_id/files_by_path', ra.validateProjectAccess, files.byPath);

    router.get('/projects/:project_id/shares', ra.validateProjectAccess, shares.getList);
    router.post('/projects/:project_id/shares', ra.validateProjectAccess, shares.create);
    router.delete('/projects/:project_id/shares/:share_id', ra.validateProjectAccess, shares.remove);

    experiments.createRoutes(router);

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

