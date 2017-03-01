class QuickbarSamplesService {
    /*@ngInject*/
    constructor(projectsAPI, experimentsAPI, datasetsAPI, toast) {
        this.projectsAPI = projectsAPI;
        this.experimentsAPI = experimentsAPI;
        this.datasetsAPI = datasetsAPI;
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
        return this.datasetsAPI.getSamplesForDataset(projectId, experimentId, datasetId)
            .then(
                (samples) => this.datasetSamples = samples,
                () => this.toast.error('Unable to retrieve dataset samples')
            );
    }
}

angular.module('materialscommons').service('quickbarSamples', QuickbarSamplesService);
