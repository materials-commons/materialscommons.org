class DatasetsAPIService {
    /*@ngInject*/
    constructor(projectsAPIRoute, Restangular, toast) {
        this.projectsAPIRoute = projectsAPIRoute;
        this.Restangular = Restangular;
        this.toast = toast;
    }

    getDatasetsForProject(projectId) {
        return this.Restangular.one('v3').one('listDatasets').customPOST({project_id: projectId}).then(datasets => datasets.plain().data);
    }

    addFilesToProjectDataset(projectId, datasetId, fileIds) {
        return this.Restangular.one('v3').one('addDatasetFiles').customPOST({
            project_id: projectId,
            dataset_id: datasetId,
            files: fileIds
        }).then(dataset => dataset.plain().data);
    }

    deleteFilesFromProjectDataset(projectId, datasetId, fileIds) {
        return this.Restangular.one('v3').one('deleteDatasetFiles').customPOST({
            project_id: projectId,
            dataset_id: datasetId,
            files: fileIds
        }).then(dataset => dataset.plain().data);
    }

    getDatasetForProject(projectId, datasetId) {
        return this.Restangular.one('v3').one('getDataset').customPOST({
            project_id: projectId,
            dataset_id: datasetId
        }).then(d => d.plain().data);
    }

    getProjectDatasetFiles(projectId, datasetId) {
        return this.Restangular.one('v3').one('getDatasetFiles').customPOST({
            project_id: projectId,
            dataset_id: datasetId
        }).then(d => d.plain().data);
    }

    getProjectDatasetSamplesAndProcesses(projectId, datasetId) {
        return this.Restangular.one('v3').one('getDatasetSamplesAndProcesses').customPOST({
            project_id: projectId,
            dataset_id: datasetId
        }).then(d => d.plain().data);
    }

    createDatasetForProject(projectId, title, samples, fileSelection) {
        return this.Restangular.one('v3').one('createDataset').customPOST({
            project_id: projectId,
            title: title,
            samples: samples,
            file_selection: fileSelection,
        }).then(d => d.plain().data);
    }

    publishProjectDataset(projectId, datasetId) {
        return this.Restangular.one('v3').one('publishDataset').customPOST({
            project_id: projectId,
            dataset_id: datasetId
        }).then(d => d.plain().data);
    }

    unpublishProjectDataset(projectId, datasetId) {
        return this.Restangular.one('v3').one('unpublishDataset').customPOST({
            project_id: projectId,
            dataset_id: datasetId
        }).then(d => d.plain().data);
    }

    updateDatasetFileSelection(projectId, datasetId, selection) {
        return this.Restangular.one('v3').one('updateDatasetFileSelection').customPOST({
            project_id: projectId,
            dataset_id: datasetId,
            file_selection: selection,
        }).then(
            d => d.plain().data,
            e => this.toast.error(e.error)
        );
    }

    ////////////////////

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

    updateProjectDatasetDetails(projectId, datasetId, details) {
        return this.projectsAPIRoute(projectId).one('datasets', datasetId).customPUT(details).then(d => d.plain());
    }

    publishDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('publish').customPUT({}).then(d => d.plain());
    }

    checkDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('publish').one('check').customGET().then(d => d.plain());
    }

    unpublishDataset(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('unpublish').customPUT({}).then(d => d.plain());
    }

    createNewDoi(projectId, experimentId, datasetId, details) {
        // Details: 'title', 'author', 'publication_year', 'description' (optional)
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId)
            .one('doi').customPOST(details).then(d => d.plain());
    }

    createDOI(projectId, datasetId, details) {
        return this.projectsAPIRoute(projectId).one('datasets', datasetId).one('doi').customPOST(details).then(d => d.plain());
    }

    getDoiExternalLink(projectId, experimentId, datasetId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('datasets', datasetId).one('doi').one('link').get();
    }
}

angular.module('materialscommons').service('datasetsAPI', DatasetsAPIService);
