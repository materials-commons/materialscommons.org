class MCExperimentPublishComponentController {
    /*@ngInject*/
    constructor($stateParams, datasetsAPI, toast) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetsAPI = datasetsAPI;
        this.toast = toast;
        this.publishedDatasets = [];
        this.inprocessDatasets = [];
    }

    $onInit() {
        this.datasetsAPI.getDatasetsForExperiment(this.projectId, this.experimentId)
            .then(
                (datasets) => {
                    this.publishedDatasets = datasets.filter(ds => ds.published);
                    this.inprocessDatasets = datasets.filter(ds => !ds.published);
                },
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
    }

    createNewDataset() {
        this.datasetsAPI.createDatasetForExperiment(this.projectId, this.experimentId, "new dataset", "my new dataset")
            .then(
                () => {
                // (dataset) => {  // dataset defined but not used - when log statement commented out
                    // ?.log('dataset', dataset.plain());
                },
                () => this.toast.error('Unable to create new dataset')
            );
    }
}

angular.module('materialscommons').component('mcExperimentPublish', {
    templateUrl: 'app/project/experiments/experiment/components/publish/mc-experiment-publish.html',
    controller: MCExperimentPublishComponentController
});
