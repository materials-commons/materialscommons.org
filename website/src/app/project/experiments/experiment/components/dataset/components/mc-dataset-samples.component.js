class MCDatasetSamplesComponentController {
    /*@ngInject*/
    constructor($mdDialog, datasetService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
    }

    showSample(sample) {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowSampleDialogController,
            bindToController: true,
            locals: {
                sample: sample
            }
        });
    }

    removeSample(sample) {
        this.datasetService.updateSamplesInDataset(this.projectId, this.experimentId, this.datasetId, [], [sample.id])
            .then(
                (dataset) => this.mcExperimentDataset.dataset = dataset,
                () => this.toast.error('Failed to remove sample from dataset')
            );
    }
}

class ShowSampleDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcDatasetSamples', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-samples.html',
    controller: MCDatasetSamplesComponentController,
    bindings: {
        samples: '<'
    },
    require: {
        mcExperimentDataset: '^mcExperimentDataset'
    }
});
