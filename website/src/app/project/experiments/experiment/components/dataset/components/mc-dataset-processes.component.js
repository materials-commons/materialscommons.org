class MCDatasetProcessesComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
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
    }
});
