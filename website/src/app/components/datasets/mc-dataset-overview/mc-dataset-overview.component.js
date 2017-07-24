class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User) {
        this.showFiles = User.isAuthenticated();
        this.showProcessesWorkflow = false;
    }
}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<'
    }
});
