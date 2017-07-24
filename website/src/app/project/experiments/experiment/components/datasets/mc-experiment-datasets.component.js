class MCExperimentDatasetsComponentController {
    /*@ngInject*/
    constructor($stateParams, datasetsAPI, toast, $state, $mdDialog) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetsAPI = datasetsAPI;
        this.toast = toast;
        this.$state = $state;
        this.$mdDialog = $mdDialog;
        this.datasets = [];
    }

    $onInit() {
        this.datasetsAPI.getDatasetsForExperiment(this.projectId, this.experimentId)
            .then(
                (datasets) => this.datasets = datasets,
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
    }

    canDelete(ds) {
        return !ds.doi && !ds.published;
    }

    deleteTooltip (ds) {
        let tooltip = "Click to delete this dataset.";
        if (ds.doi) {
            tooltip = "Can not delete a dataset with an assigned DOI"
        } else if (ds.published) {
            tooltip = "Can not delete a dataset that is published; unpublish dataset first."
        }
        return tooltip;
    }


    createNewDataset() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/datasets/new-dataset-dialog.html',
            controller: NewExperimentDatasetDialogController,
            controllerAs: '$ctrl',
            bindingToController: true
        }).then(
            (dataset) => {
                this.datasetsAPI.getDatasetsForExperiment(this.projectId, this.experimentId)
                    .then(
                        (datasets) => {
                            this.datasets = datasets;
                            this.$state.go("project.experiment.datasets.dataset", {dataset_id: dataset.id});
                        },
                        () => this.toast.error('Unable to retrieve datasets for experiment')
                    )
            }
        );
    }

    openDataset(datasetId) {
        this.$state.go("project.experiment.datasets.dataset", {dataset_id: datasetId});
    }

    removeDataset(datasetId) {
        this.datasetsAPI.deleteDatasetFromExperiment(this.projectId, this.experimentId, datasetId)
            .then(
                () => this.datasets = this.datasets.filter(d => d.id !== datasetId),
                () => this.toast.error("Unable to delete dataset from experiment")
            );
    }
}

class NewExperimentDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, datasetsAPI, toast, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.datasetsAPI = datasetsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.toast = toast;
        this.title = "";
        this.description = "";
    }

    create() {
        if (this.name !== '') {
            this.datasetsAPI.createDatasetForExperiment(this.projectId, this.experimentId, this.title, this.description)
                .then(
                    (dataset) => this.$mdDialog.hide(dataset),
                    () => this.toast.error('Unable to create new dataset')
                );
        }
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcExperimentDatasets', {
    templateUrl: 'app/project/experiments/experiment/components/datasets/mc-experiment-datasets.html',
    controller: MCExperimentDatasetsComponentController
});