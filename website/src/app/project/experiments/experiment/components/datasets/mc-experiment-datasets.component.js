class MCExperimentDatasetsComponentController {
    /*@ngInject*/
    constructor($stateParams, datasetService, toast, $state) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetService = datasetService;
        this.toast = toast;
        this.$state = $state;
        this.datasets = [];
    }

    $onInit() {
        this.datasetService.getDatasetsForExperiment(this.projectId, this.experimentId)
            .then(
                (datasets) => this.datasets = datasets,
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
    }

    createNewDataset() {
        this.datasetService.createDatasetForExperiment(this.projectId, this.experimentId, "new dataset", "my new dataset")
            .then(
                (dataset) => {
                    console.log('dataset', dataset.plain());
                },
                () => this.toast.error('Unable to create new dataset')
            );
    }

    openDataset(datasetId) {
        this.$state.go("project.experiment.dataset", {dataset_id: datasetId});
    }
}

angular.module('materialscommons').component('mcExperimentDatasets', {
    templateUrl: 'app/project/experiments/experiment/components/datasets/mc-experiment-datasets.html',
    controller: MCExperimentDatasetsComponentController
});