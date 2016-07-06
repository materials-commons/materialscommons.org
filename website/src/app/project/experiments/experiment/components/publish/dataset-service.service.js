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
}

angular.module('materialscommons').service('datasetService', DatasetService);
