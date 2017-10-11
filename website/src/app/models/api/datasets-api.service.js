class DatasetsAPIService {
    /*@ngInject*/
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    getDatasetsForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets')
            .getList().then(datasets => datasets.plain());
    }

    getDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .get().then(d => d.plain());
    }

    createDatasetForExperiment(projectId, experimentId, title, description) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets').customPOST({
            title: title,
            description: description
        }).then(d => d.plain());
    }

    deleteDatasetFromExperiment(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).remove();
    }

    addSampleToDataset(projectId, experimentId, datasetId, sampleId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('samples', sampleId).customPUT().then(d => d.plain());
    }

    updateSamplesInDataset(projectId, experimentId, datasetId, sampleIdsToAdd, sampleIdsToDelete) {
        let toAdd = sampleIdsToAdd.map(sid => ({command: 'add', id: sid}));
        let toDelete = sampleIdsToDelete.map(sid => ({command: 'delete', id: sid}));
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('samples').customPUT({
            samples: toAdd.concat(toDelete)
        }).then(d => d.plain());
    }

    getSamplesForDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('samples')
            .getList().then(samples => samples.plain());
    }

    updateFilesInDataset(projectId, experimentId, datasetId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('files').customPUT({
            files: toAdd.concat(toDelete)
        }).then(files => files.plain());
    }

    updateProcessesInDataset(projectId, experimentId, datasetId, processIdsToAdd, processIdsToDelete) {
        let toAdd = processIdsToAdd.map(id => ({command: 'add', id: id}));
        let toDelete = processIdsToDelete.map(id => ({command: 'delete', id: id}));
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('processes').customPUT({
            processes: toAdd.concat(toDelete)
        }).then(d => d.plain());
    }

    updateDatasetDetails(projectId, experimentId, datasetId, details) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .customPUT(details).then(d => d.plain());
    }

    publishDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('publish').customPUT({}).then(d => d.plain());
    }

    unpublishDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('unpublish').customPUT({}).then(d => d.plain());
    }

    createNewDoi(projectId, experimentId, datasetId, details){
        // Details: 'title', 'author', 'publication_year', 'description' (optional)
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('doi').customPOST(details).then(d => d.plain());
    }

    getDoiMetadata(projectId, experimentId, datasetId){
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('doi').get();
    }

    // updateDoiMetadata(projectId, experimentId, datasetId, details) {
    //   Details: (all optional) 'title', 'author', 'publication_year', 'details'
    //   return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('doi').customPut({details});
    // }

    getDoiExternalLink(projectId, experimentId, datasetId){
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('doi').one('link').get();
    }

    getDoiServerStatus(projectId, experimentId, datasetId){
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('doiserverstatus').get();
    }

}

angular.module('materialscommons').service('datasetsAPI', DatasetsAPIService);
