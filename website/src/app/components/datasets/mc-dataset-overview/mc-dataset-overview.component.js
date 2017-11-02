class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, publicDatasetsAPI) {
        this.showFiles = User.isAuthenticated();
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }
}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<'
    }
});
