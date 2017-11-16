class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, $mdDialog, publicDatasetsAPI) {
        this.isAuthenticated = User.isAuthenticated();
        this.userId = User.u();
        // Dataset fake stats: waiting on service interface
        this.markedAsUseful = true;
        // Dataset fake stats: waiting on service interface
        this.othersMarkedAsUseful = true;
        this.$mdDialog = $mdDialog;
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    $onInit() {
        console.log("Public Dataset Overview initialized");
        let userId = '';
        if (this.isAuthenticated) {
            userId = this.userId;
        }
        let datasetId = this.dataset.id;
        this.publicDatasetsAPI.datasetWasViewed(userId, datasetId);
    }

    otherCount() {
        return 5;
    }

    otherWord() {
        if (this.otherCount() === 1) return "other";
        return "others";
    }

    onToggleUseful(){
        this.markedAsUseful = !this.markedAsUseful
        if (this.markedAsUseful) {
            console.log("User marked dataset as useful", this.userId, this.dataset.title);
        }
        else {
            console.log("User unmarked dataset as useful", this.userId, this.dataset.title);
        }
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


