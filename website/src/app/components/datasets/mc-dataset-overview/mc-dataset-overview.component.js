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
        }
    }

    clickUsefulToggle() {
        this.onToggleUseful();
    }

    onShowOthersUseful() {
        this.showOthersUsefulDialog()
    }

    onDeleteFromCommentCount(){
        this.dataset.stats.download_count += -1;
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


}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<',
        onToggleUseful: '&',          // defined in container
        onDownloadRequest: '&',       // defined in container
        onAddToCommentCount: '&',     // defined in container
        onDeleteFromCommentCount: '&' // defined in container
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


