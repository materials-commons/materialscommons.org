

/*@ngInject*/
class MCExperimentProcessesTableComponentController {
    constructor($mdDialog) {
        this.sortOrder = "name";
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

angular.module('materialscommons').component('mcExperimentProcessesTable', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-experiment-processes-table.html',
    controller: MCExperimentProcessesTableComponentController,
    bindings: {
        processes: '<',
        filterBy: '='
    }
});
