class ProcessesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPI(projectId).one('processes', processId).customPUT(updateArgs);
    }

    deleteProcess(projectId,processId) {
        console.log("Deleting process: " + projectId,processId);
        var ret =  this.projectsAPI(projectId).one('processes', processId).remove();
        console.log(ret);
        return ret;
    }
}

angular.module('materialscommons').service('processesService', ProcessesService);
