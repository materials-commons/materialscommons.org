class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, $mdDialog, publicDatasetsAPI) {
        this.isAuthenticated = User.isAuthenticated();
        this.userId = User.u();
        this.$mdDialog = $mdDialog;
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    $onChanges(changes) {
        if (!changes.dataset.isFirstChange()) {
            this.dataset = changes.dataset.currentValue;
            console.log("dataset changes reported - overview");
        } else {
            console.log("Boo!")
        }
    }

    clickUsefulToggle() {
        this.onToggleUseful();
    }

    onShowOthersUseful() {
        this.showOthersUsefulDialog()
    }

    showOthersUsefulDialog() {
        let dataset = this.dataset;
        return this.$mdDialog.show({
            templateUrl: 'app/components/datasets/mc-dataset-overview/dialog-show-useful-others.html',
            controller: ShowUsefulOtherDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                dataset: dataset
            }
        })
    }

    onchange(){
        console.log("Comments added are not changing data display, in stats display line.");
    }

}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<',
        onToggleUseful: '&',
        onDownloadRequest: '&'
    }
});


class ShowUsefulOtherDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    close() {
        this.$mdDialog.hide();
    }

}


