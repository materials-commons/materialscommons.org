class ExperimentsService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    getAllForProject(projectID) {
        return this.projectsAPI(projectID).one('experiments').getList();
    }

    createForProject(projectID, experiment) {
        return this.projectsAPI(projectID).one('experiments').customPOST(experiment);
    }

    updateForProject(projectID, experimentID, what) {
        return this.projectsAPI(projectID).one('experiments', experimentID).customPUT(what);
    }

    getForProject(projectID, experimentID) {
        return this.projectsAPI(projectID).one('experiments', experimentID).customGET();
    }

    createTask(projectID, experimentID, experimentTask) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('tasks').customPOST(experimentTask);
    }

    updateTask(projectID, experimentID, taskID, task) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('tasks', taskID).customPUT(task);
    }

    addTemplateToTask(projectID, experimentID, taskID, templateID) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('tasks', taskID)
            .one('template', templateID).customPOST({});
    }

    updateTaskTemplateProperties(projectID, experimentID, taskID, updateArgs) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('tasks', taskID)
            .one('template').customPUT(updateArgs);
    }

    updateTaskTemplateFiles(projectId, experimentId, taskId, updateFilesArgs) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('tasks', taskId)
            .one('template').customPUT(updateFilesArgs);
    }

    updateTaskTemplateSamples(projectId, experimentId, taskId, updateSamplesArgs) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('tasks', taskId)
            .one('template').customPUT(updateSamplesArgs);
    }

    updateProcess(projectId, experimentId, processId, updateArgs) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('processes', processId).customPUT(updateArgs);
    }

    deleteTask(projectID, experimentID, taskID) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('tasks', taskID).customDELETE();
    }

    getSamplesForExperiment(projectId, experimentId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples').customGET();
    }

    getProcessesForExperiment(projectId, experimentId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('processes').customGET();
    }

    getProcessForExperiment(projectId, experimentId, processId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('processes', processId).customGET();
    }

    getFilesForExperiment(projectId, experimentId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('files').customGET();
    }

    createProcessFromTemplate(projectId, experimentId, templateId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('processes').one('templates', templateId)
            .customPOST();
    }
}

angular.module('materialscommons').service('experimentsService', ExperimentsService);
