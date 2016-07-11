class MCDatasetSamplesComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    showSample(sample) {
        console.log('showSample', sample);
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

angular.module('materialscommons').component('mcDatasetSamples', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-samples.html',
    controller: MCDatasetSamplesComponentController,
    bindings: {
        samples: '<'
    }
});
