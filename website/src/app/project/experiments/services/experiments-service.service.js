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

    deleteTask(projectID, experimentID, taskID) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('task', taskID).customDELETE();
    }
}

angular.module('materialscommons').service('experimentsService', ExperimentsService);
