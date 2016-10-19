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

    updateFilesInProcess(projectId, processId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPI(projectId).one('processes', processId).customPUT({
            files: toAdd.concat(toDelete)
        });
    }

    updateSamplesInProcess(projectId, processId, samplesToAdd, samplesToDelete) {
        let toAdd = samplesToAdd.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
        let toDelete = samplesToDelete.map(s => ({command: 'delete', id: s.id, property_set_id: s.property_set_id}));
        return this.projectsAPI(projectId).one('processes', processId).customPUT({
            samples: toAdd.concat(toDelete)
        });
    }
}

angular.module('materialscommons').service('processesService', ProcessesService);
