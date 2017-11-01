class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, publicDatasetsAPI) {
        this.showFiles = User.isAuthenticated();
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    commentsUpdated() {
        let id = this.dataset.id;
        this.publicDatasetsAPI.getDataset(id)
            .then((dataset) => {
                this.dataset.comments = dataset.comments;
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
