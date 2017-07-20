angular.module('materialscommons').component('mcProjectSamplesTable', {
    templateUrl: 'app/project/samples/mc-project-samples-table.html',
    controller: MCProjectSamplesTableComponentController,
    bindings: {
        samples: '<',
        filterBy: '='
    }
});

/*@ngInject*/
function MCProjectSamplesTableComponentController($mdDialog) {
    const ctrl = this;
    ctrl.showSample = showSample;
    ctrl.sortOrder = "name";

    function showSample(sample) {
        $mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowSampleDialogController,
            bindToController: true,
            multiple: true,
            locals: {
                sample: sample
            }
        });
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
