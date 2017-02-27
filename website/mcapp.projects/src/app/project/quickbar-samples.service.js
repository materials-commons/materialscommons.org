class QuickbarSamplesService {
    /*@ngInject*/
    constructor(projectsAPI, experimentsAPI, datasetService, toast) {
        this.projectsAPI = projectsAPI;
        this.experimentsAPI = experimentsAPI;
        this.datasetService = datasetService;
        this.toast = toast;
    }

    getProjectSamples(projectId) {
        return this.projectsAPI.getProjectSamples(projectId)
            .then(
                (samples) => samples,
                () => this.toast.error('Unable to retrieve project samples')
            );
    }

    getExperimentSamples(projectId, experimentId) {
        return this.experimentsAPI.getSamplesForExperiment(projectId, experimentId)
            .then(
                (samples) => samples,
                () => this.toast.error('Unable to retrieve experiment samples')
            );
    }

    getDatasetSamples(projectId, experimentId, datasetId) {
        return this.datasetService.getSamplesForDataset(projectId, experimentId, datasetId)
            .then(
                (samples) => this.datasetSamples = samples,
                () => this.toast.error('Unable to retrieve dataset samples')
            );
    }
}

angular.module('materialscommons').service('quickbarSamples', QuickbarSamplesService);
