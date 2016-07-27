class QuickbarSamplesService {
    /*@ngInject*/
    constructor(projectsService, experimentsService, datasetService, toast) {
        this.projectsService = projectsService;
        this.experimentsService = experimentsService;
        this.datasetService = datasetService;
        this.toast = toast;
    }

    getProjectSamples(projectId) {
        return this.projectsService.getProjectSamples(projectId)
            .then(
                (samples) => samples,
                () => this.toast.error('Unable to retrieve project samples')
            );
    }

    getExperimentSamples(projectId, experimentId) {
        return this.experimentsService.getSamplesForExperiment(projectId, experimentId)
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
