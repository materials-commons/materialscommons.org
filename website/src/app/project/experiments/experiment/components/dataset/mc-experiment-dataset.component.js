class MCExperimentDatasetComponentController {
    /*@ngInject*/
    constructor(datasetService, toast, $stateParams, selectItems) {
        this.datasetService = datasetService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.dataset = null;
        this.selectItems = selectItems;
    }

    $onInit() {
        this.datasetService.getDataset(this.projectId, this.experimentId, this.datasetId)
            .then(
                (dataset) => this.dataset = dataset,
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
    }

    selectSamples() {
        this.selectItems.open('samples', {experimentId: this.experimentId}).then(
            (selected) => {
                if (selected.samples.length) {
                    let s = selected.samples[0];
                    this.datasetService.addSampleToDataset(this.projectId, this.experimentId, this.datasetId, s.id)
                        .then(
                            () => console.log('added sample!'),
                            () => this.toast.error('Failed to add sample to dataset')
                        );
                }
            }
        );
    }
}

angular.module('materialscommons').component('mcExperimentDataset', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/mc-experiment-dataset.html',
    controller: MCExperimentDatasetComponentController
});
