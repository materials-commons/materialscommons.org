class MCProjectDatasetsViewComponentController {
    /*@ngInject*/
    constructor(projectDatasetsViewService, $stateParams) {
        this.projectDatasetsViewService = projectDatasetsViewService;
        this.$stateParams = $stateParams;
        this.state = {
            datasets: []
        };
    }

    $onChanges(changes) {
        if (changes.datasets) {
            this.state.datasets = angular.copy(changes.datasets.currentValue);
        }
    }

    createNewDataset() {
        this.projectDatasetsViewService.createNewDataset(this.$stateParams.project_id).then(
            (dataset) => {
                this.onNewDataset({dataset: dataset});
            }
        );
    }

    handleDeleteDataset(id) {
        this.onDeleteDataset({id: id});
    }
}

angular.module('materialscommons').component('mcProjectDatasetsView', {
    template: require('./project-datasets-view.html'),
    controller: MCProjectDatasetsViewComponentController,
    bindings: {
        datasets: '<',
        onNewDataset: '&',
        onDeleteDataset: '&',
    }
});
