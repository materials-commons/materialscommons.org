class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User) {
        this.showFiles = User.isAuthenticated();
        this.showProcessesWorkflow = false;
        console.log("MCDatasetOverviewComponentController");
        console.log("dataset: ", this.dataset);
    }

    commentsUpdated() {
        console.log("Re-fetch dataset from server");
    }
}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<'
    }
});
