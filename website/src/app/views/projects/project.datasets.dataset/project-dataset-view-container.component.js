class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcdsstore) {
        this.$stateParams = $stateParams;
        this.mcdsstore = mcdsstore;
        this.state = {
            dataset: null
        };
    }

    $onInit() {
        this.state.dataset = angular.copy(this.mcdsstore.getDataset(this.$stateParams.dataset_id));
        console.log('this.state.dataset', this.state.dataset);
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `
        <mc-project-dataset-view dataset="$ctrl.state.dataset" layout-fill ng-if="$ctrl.state.dataset">
        </mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});