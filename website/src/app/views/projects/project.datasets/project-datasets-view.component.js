class MCProjectDatasetsViewComponentController {
    /*@ngInject*/
    constructor(projectDatasetsViewService) {
        this.projectDatasetsViewService = projectDatasetsViewService;
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
        this.projectDatasetsViewService.createNewDataset().then(
            (dataset) => {
                this.onNewDataset({dataset: dataset});
            }
        );
    }
}

angular.module('materialscommons').component('mcProjectDatasetsView', {
    template: require('./project-datasets-view.html'),
    controller: MCProjectDatasetsViewComponentController,
    bindings: {
        datasets: '<',
        onNewDataset: '&'
    }
});
