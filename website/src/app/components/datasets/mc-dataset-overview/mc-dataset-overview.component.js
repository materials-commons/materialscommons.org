class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, $mdDialog, publicDatasetsAPI) {
        this.isAuthenticated = User.isAuthenticated();
        this.userId = User.u();
        this.$mdDialog = $mdDialog;
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    $onInit() {
        let userId = '';
        if (this.isAuthenticated) {
            userId = this.userId;
        }
        let datasetId = this.dataset.id;

        // Dataset fake stats: waiting on service interface
        this.markedAsUseful = true;
        this.othersMarkedAsUsefulCount = 5;

        this.publicDatasetsAPI.datasetWasViewed(userId, datasetId);
    }

    onToggleUseful(){
        this.markedAsUseful = !this.markedAsUseful;
        this.publicDatasetsAPI.updateUseful(this.userId, this.dataset.id, this.markedAsUseful);
    }

    onShowOthersUseful() {
        console.log("Show others who marked this as useful", this.userId, this.dataset.title);
        this.dataset.useful= {others: [
            {id: 'one@test.mc', fullname: 'Other One'},
            {id: 'two@test.mc', fullname: 'Other Two'},
            {id: 'three@test.mc', fullname: 'Other Three'},
            {id: 'four@test.mc', fullname: 'Other Four'},
        ]};
        this.showOthersUsefulDialog()
    }

    showOthersUsefulDialog() {
        let dataset = this.dataset;
        console.log("dataset.title: ", dataset.title);
        console.log("dataset.useful.others = ", dataset.useful.others);
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
        dataset: '<'
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


