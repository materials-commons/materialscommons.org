class MCProcessSamplesTableComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            samples: [],
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
        }
    }

    showSample(sample) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowSampleDialogController,
            bindToController: true,
            multiple: true,
            clickOutsideToClose: true,
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

angular.module('materialscommons').component('mcProcessSamplesTable', {
    controller: MCProcessSamplesTableComponentController,
    template: require('./process-samples-table.html'),
    bindings: {
        samples: '<'
    }
});