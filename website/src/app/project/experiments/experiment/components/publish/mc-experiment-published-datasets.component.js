class MCExperimentPublishedDatasetsComponentController {
    constructor($stateParams, datasetService, toast) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetService = datasetService;
        this.toast = toast;
        this.datasets = [];
    }

    $onInit() {
        this.datasetService.getDatasetsForExperiment(this.projectId, this.experimentId)
            .then(
                (datasets) => {
                    console.log('datasets', datasets.plain());
                    this.datasets = datasets;
                },
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
    }
}

angular.module('materialscommons').component('mcExperimentPublishedDatasets', {
    templateUrl: 'app/project/experiments/experiment/components/publish/mc-experiment-published-datasets.html',
    controller: MCExperimentPublishedDatasetsComponentController
});
