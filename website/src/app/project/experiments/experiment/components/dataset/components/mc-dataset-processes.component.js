class MCDatasetProcessesComponentController {
    /*@ngInject*/
    constructor($mdDialog, datasetService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
    }

    showProcess(process) {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-process-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowProcessDialogController,
            bindToController: true,
            locals: {
                process: process
            }
        });
    }

    removeProcess(process) {
        this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [process.id])
            .then(
                (dataset) => this.mcExperimentDataset.dataset = dataset,
                () => this.toast.error('Failed to remove process from dataset')
            );
    }
}

class ShowProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcDatasetProcesses', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-processes.html',
    controller: MCDatasetProcessesComponentController,
    bindings: {
        processes: '<'
    },
    require: {
        mcExperimentDataset: '^mcExperimentDataset'
    }
});
