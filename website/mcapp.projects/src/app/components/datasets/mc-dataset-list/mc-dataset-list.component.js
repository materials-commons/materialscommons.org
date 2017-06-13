class MCDatasetListComponentController {
    /*@ngInject*/
    constructor($stateParams, datasetsAPI, User) {
        this.projectId = $stateParams.project_id;
        this.experimentId = 'e83207f4-c29f-4672-8035-cdfeae30a7fd';
        this.datasetsAPI = datasetsAPI;
        this.isAuthenticated = User.isAuthenticated();
        console.log('this.detailsRoute', this.detailsRoute);
    }

    $onInit() {
        // this.datasetsAPI.getDatasetsForExperiment('e634ee47-b217-4547-a345-5007cd146dbd', '511930bd-96a5-4678-9626-ef79aceb75b5').then(
        //     (datasets) => this.datasets = datasets
        // );
    }
}

angular.module('materialscommons').component('mcDatasetList', {
    templateUrl: 'app/components/datasets/mc-dataset-list/mc-dataset-list.html',
    controller: MCDatasetListComponentController,
    bindings: {
        datasets: '<',
        detailsRoute: '@'
    }
});