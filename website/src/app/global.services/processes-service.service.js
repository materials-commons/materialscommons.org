class ProcessesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPI(projectId).one('processes', processId).customPUT(updateArgs);
    }
}

angular.module('materialscommons').service('processesService', ProcessesService);