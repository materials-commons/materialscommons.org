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
        console.log('MCDatasetOverviewComponentController.$onInit()', this.dataset);
        let userId = '';
        if (this.isAuthenticated) {
            userId = this.userId;
        }
        let datasetId = this.dataset.id;

        this.setUsefulMarkerValues();

        this.publicDatasetsAPI.datasetWasViewed(userId, datasetId);
    }

    $onChanges(changes) {
        console.log('-->',changes);
    }

    setUsefulMarkerValues() {
        console.log('setUsefulMarkerValues', this.dataset);
        this.markedAsUseful = false;
        this.othersMarkedAsUsefulCount = 0;
        let interestedUsers = this.dataset.stats.interested_users;
        for (let i = 0; i < interestedUsers.length; i++) {
            if (interestedUsers[i].user_id === this.userId){
                this.markedAsUseful = true;
            } else {
                this.othersMarkedAsUsefulCount += 1;
            }
        }
    }

    onToggleUseful(){
        this.markedAsUseful = !this.markedAsUseful;
        this.publicDatasetsAPI.updateUseful(this.userId, this.dataset.id, this.markedAsUseful)
            .then((dataset) => {
                console.log("onToggleUseful",dataset);
                this.dataset = dataset;
                this.setUsefulMarkerValues();
            }
        );
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


