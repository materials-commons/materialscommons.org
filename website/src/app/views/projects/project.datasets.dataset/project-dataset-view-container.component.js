class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcdsstore, mcprojectstore2) {
        this.$stateParams = $stateParams;
        this.mcdsstore = mcdsstore;
        this.mcprojectstore2 = mcprojectstore2;
        this.state = {
            dataset: null
        };
    }

    $onInit() {
        this.state.dataset = angular.copy(this.mcdsstore.getDataset(this.$stateParams.dataset_id));
        this.mcprojectstore2.loadProject(this.$stateParams.project_id);
        // console.log('this.state.dataset', this.state.dataset);
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `
        <mc-project-dataset-view dataset="$ctrl.state.dataset" ng-if="$ctrl.state.dataset">
        </mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});