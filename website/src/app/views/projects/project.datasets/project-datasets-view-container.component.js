class MCProjectDatasetsViewContainerComponentController {
    /*@ngInject*/
    constructor(mcdsstore) {
        this.mcdsstore = mcdsstore;
        this.state = {
            datasets: []
        };
    }

    $onInit() {
        this.state.datasets = this.mcdsstore.getDatasets();
    }

    handleNewDataset(dataset) {
        let ds = this.mcdsstore.createDataset(dataset.name, dataset.samples, dataset.experiments);
        this.mcdsstore.addDataset(ds);
        this.state.datasets = this.mcdsstore.getDatasets();
    }
}

angular.module('materialscommons').component('mcProjectDatasetsViewContainer', {
    template: `
        <mc-project-datasets-view datasets="$ctrl.state.datasets" on-new-dataset="$ctrl.handleNewDataset(dataset)">
        </mc-project-datasets-view>`,
    controller: MCProjectDatasetsViewContainerComponentController
});