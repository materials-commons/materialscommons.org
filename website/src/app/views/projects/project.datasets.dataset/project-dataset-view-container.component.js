class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            dataset: null
        };
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `
        <mc-project-dataset-view dataset="$ctrl.state.dataset" ng-if="$ctrl.state.dataset">
        </mc-project-dataset-view>`
});