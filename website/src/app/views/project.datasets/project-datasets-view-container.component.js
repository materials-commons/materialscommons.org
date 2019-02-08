class MCProjectDatasetsViewContainerComponentController {
    /*@ngInject*/
    constructor(mcdsstore, $stateParams, datasetsAPI, mcStateStore, projectDatasetsViewService) {
        this.mcdsstore = mcdsstore;
        this.$stateParams = $stateParams;
        this.datasetsAPI = datasetsAPI;
        this.mcStateStore = mcStateStore;
        this.projectDatasetsViewService = projectDatasetsViewService;
        this.state = {
            datasets: []
        };
    }

    $onInit() {
        this.loadDatasets();
    }

    loadDatasets() {
        this.datasetsAPI.getDatasetsForProject(this.$stateParams.project_id).then(
            (datasets) => {
                let p = this.mcStateStore.getState('project');
                let transformed = [];
                datasets.forEach(ds => {
                    transformed.push(this.mcdsstore.transformDataset(ds, p));
                });
                this.mcdsstore.reloadDatasets(transformed);
                this.state.datasets = this.mcdsstore.getDatasets();
            }
        );
    }

    handleNewDataset() {
        this.mcStateStore.fire('sync:project');
        this.loadDatasets();
    }
}

angular.module('materialscommons').component('mcProjectDatasetsViewContainer', {
    template: `
        <mc-project-datasets-view datasets="$ctrl.state.datasets" on-new-dataset="$ctrl.handleNewDataset(dataset)">
        </mc-project-datasets-view>`,
    controller: MCProjectDatasetsViewContainerComponentController
});