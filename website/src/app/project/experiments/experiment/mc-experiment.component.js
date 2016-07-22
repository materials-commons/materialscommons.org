class MCExperimentComponentController {
    /*@ngInject*/
    constructor(currentExperiment, $stateParams, projectsService, experimentsService, datasetService, toast, showSampleService) {
        this.currentExperiment = currentExperiment;
        this.experiment = currentExperiment.get();
        this.showSamplesSidenav = false;
        this.$stateParams = $stateParams;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.projectsService = projectsService;
        this.experimentsService = experimentsService;
        this.datasetService = datasetService;
        this.projectSamples = [];
        this.experimentSamples = [];
        this.datasetExamples = [];
        this.toast = toast;
        this.showSampleService = showSampleService;
    }

    openSamplesSidenav() {
        this.datasetId = this.$stateParams.dataset_id;
        this.showSamplesSidenav = true;
        this.projectsService.getProjectSamples(this.projectId)
            .then(
                (samples) => this.projectSamples = samples,
                () => this.toast.error('Unable to retrieve project samples')
            );
        this.experimentsService.getSamplesForExperiment(this.projectId, this.experimentId)
            .then(
                (samples) => this.experimentSamples = samples,
                () => this.toast.error('Unable to retrieve experiment samples')
            );
        if (this.datasetId) {
            this.datasetService.getSamplesForDataset(this.projectId, this.experimentId, this.datasetId)
                .then(
                    (samples) => this.datasetSamples = samples,
                    () => this.toast.error('Unable to retrieve dataset samples')
                )
        }
    }

    showSample(sample) {
        this.showSampleService.showSample(sample);
    }
}

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});