class MCChartService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    /*
    return this.$mdDialog.show({
                            templateUrl: 'app/modals/create-new-dataset-dialog.html',
                            controller: CreateNewDatasetDialogController,
                            controllerAs: '$ctrl',
                            bindToController: true,
                            clickOutsideToClose: true,
                            locals: {
                                samples: samples,
                                files: files,
                            }
     */

    selectSamples() {
        return this.$mdDialog.show({
            templateUrl: 'app/modal/select-samples-dialog.html',
            controller: MCSelectSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {}
        }).then(
            selected => selected
        );
    }

    selectAttributes() {
        return this.$mdDialog.show({
            templateUrl: 'app/modal/select-attributes-for-chart-dialog.html',
            controller: MCSelectAttributesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {}
        }).then(
            selected => selected
        )
    }
}

angular.module('materialscommons').service('mcChartService', MCChartService);

class MCSelectSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class MCSelectAttributesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}