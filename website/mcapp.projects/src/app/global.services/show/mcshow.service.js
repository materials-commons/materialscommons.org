class MCShowService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    sampleDialog(sample, multiple = true) {
        return this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: CommonDoneDismissDialogController,
            bindToController: true,
            multiple: multiple,
            locals: {
                sample: sample
            }
        });
    }
}

class CommonDoneDismissDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('mcshow', MCShowService);