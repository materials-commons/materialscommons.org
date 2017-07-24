class ShowSampleService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
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

angular.module('materialscommons').service('showSampleService', ShowSampleService);
