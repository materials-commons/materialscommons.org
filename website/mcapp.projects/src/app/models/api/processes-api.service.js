class ProcessesAPIService {
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT(updateArgs);
    }

    getProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get();
    }

    getDeleteProcessPreConditions(projectId,processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get();
    }

    deleteProcess(projectId,processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).remove();
    }

    updateFilesInProcess(projectId, processId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            files: toAdd.concat(toDelete)
        });
    }

    updateSamplesInProcess(projectId, processId, samplesToAdd, samplesToDelete) {
        let toAdd = samplesToAdd.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
        let toDelete = samplesToDelete.map(s => ({command: 'delete', id: s.id, property_set_id: s.property_set_id}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            samples: toAdd.concat(toDelete)
        });
    }
}

angular.module('materialscommons').service('processesAPI', ProcessesAPIService);
