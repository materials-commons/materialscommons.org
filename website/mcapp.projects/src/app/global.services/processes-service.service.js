class ProcessesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPI(projectId).one('processes', processId).customPUT(updateArgs);
    }

    getDeleteProcessPreConditions(projectId,processId) {
        return this.projectsAPI(projectId).one('processes', processId).get();
    }

    deleteProcess(projectId,processId) {
        return this.projectsAPI(projectId).one('processes', processId).remove();
    }
}

angular.module('materialscommons').service('processesService', ProcessesService);
