class ProcessesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPI(projectId).one('processes', processId).customPUT(updateArgs);
    }

    getDeleteProcessPreConditions(projectId,processId) {
//        console.log("getDeleteProcessPreConditions: " + projectId,processId);
        var ret =  this.projectsAPI(projectId).one('processes', processId).get();
        return ret;
    }

    deleteProcess(projectId,processId) {
//        console.log("Deleting process: " + projectId,processId);
        var ret =  this.projectsAPI(projectId).one('processes', processId).remove();
        return ret;
    }
}

angular.module('materialscommons').service('processesService', ProcessesService);
