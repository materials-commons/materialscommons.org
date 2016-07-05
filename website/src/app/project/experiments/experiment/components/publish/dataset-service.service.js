class DatasetService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    getDatasetsForExperiment(projectId, experimentId) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets').getList();
    }

    createDatasetForExperiment(projectId, experimentId, title, description) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('datasets').customPOST({
            title: title,
            description: description
        });
    }
}

angular.module('materialscommons').service('datasetService', DatasetService);
