class ProcessesAPIService {
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPIRoute(projectId).one('processes', processId)
            .customPUT(updateArgs).then(p => p.plain());
    }

    getProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get().then(p => p.plain());
    }

    getDeleteProcessPreConditions(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get();
    }

    deleteProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).remove();
    }

    getProcessFiles(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).one('files').getList()
            .then(files => files.plain());
    }

    updateFilesInProcess(projectId, processId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            files: toAdd.concat(toDelete)
        }).then(p => p.plain());
    }

    updateSamplesInProcess(projectId, processId, samplesToAdd, samplesToDelete) {
        let toAdd = samplesToAdd.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
        let toDelete = samplesToDelete.map(s => ({command: 'delete', id: s.id, property_set_id: s.property_set_id}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            samples: toAdd.concat(toDelete)
        }).then(p => p.plain());
    }
}

angular.module('materialscommons').service('processesAPI', ProcessesAPIService);
