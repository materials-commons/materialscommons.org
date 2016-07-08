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
                    let samplesToAdd = selected.samples.map(s => s.id);
                    this.datasetService.updateSamplesInDataset(this.projectId, this.experimentId, this.datasetId, samplesToAdd, [])
                        .then(
                            (dataset) => this.dataset = dataset,
                            () => this.toast.error('Failed to add samples to dataset')
                        );
                }
            }
        );
    }

    selectFiles() {
        this.selectItems.open('files', {experimentId: this.experimentId})
            .then(
                (selected) => {
                    if (selected.files.length) {
                        let filesToAdd = selected.files.map(f => f.id);
                        this.datasetService.updateFilesInDataset(this.projectId, this.experimentId, this.datasetId, filesToAdd, [])
                            .then(
                                (dataset) => this.dataset = dataset,
                                () => this.toast.error('Failed to add files to dataset')
                            )
                    }
                }
            );
    }
}

angular.module('materialscommons').component('mcExperimentDataset', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/mc-experiment-dataset.html',
    controller: MCExperimentDatasetComponentController
});
