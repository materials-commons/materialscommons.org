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

    otherCount() {
        return 5;
    }

    otherWord() {
        if (this.otherCount() === 1) return "other";
        return "others";
    }

    onMarkAsUseful(){
        console.log("User marked dataset as useful", this.userId, this.dataset.title);
    }

    onUnmarkAsUseful() {
        console.log("User unmarked dataset as useful", this.userId, this.dataset.title);
    }

    onShowOthersUseful() {
        console.log("Show others who marked this as useful", this.userId, this.dataset.title);
        this.showOthersUsefulDialog().then((val) => {
            let text = val.text;
            this.createNewFavorite(text);
        });
    }

}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<'
    }
});




