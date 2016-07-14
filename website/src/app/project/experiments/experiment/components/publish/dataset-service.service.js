class DatasetService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    getDatasetsForExperiment(projectId, experimentId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets').getList();
    }

    getDataset(projectId, experimentId, datasetId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).get();
    }

    createDatasetForExperiment(projectId, experimentId, title, description) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets').customPOST({
            title: title,
            description: description
        });
    }

    addSampleToDataset(projectId, experimentId, datasetId, sampleId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).one('samples', sampleId).customPUT();
    }

    updateSamplesInDataset(projectId, experimentId, datasetId, sampleIdsToAdd, sampleIdsToDelete) {
        let toAdd = sampleIdsToAdd.map(sid => ({command: 'add', id: sid}));
        let toDelete = sampleIdsToDelete.map(sid => ({command: 'delete', id: sid}));
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).one('samples').customPUT({
            samples: toAdd.concat(toDelete)
        });
    }

    getSamplesForDataset(projectId, experimentId, datasetId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).one('samples').getList();
    }

    updateFilesInDataset(projectId, experimentId, datasetId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).one('files').customPUT({
            files: toAdd.concat(toDelete)
        });
    }

    updateProcessesInDataset(projectId, experimentId, datasetId, processIdsToAdd, processIdsToDelete) {
        let toAdd = processIdsToAdd.map(id => ({command: 'add', id: id}));
        let toDelete = processIdsToDelete.map(id => ({command: 'delete', id: id}));
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets', datasetId).one('processes').customPUT({
            processes: toAdd.concat(toDelete)
        });
    }
}

angular.module('materialscommons').service('datasetService', DatasetService);
