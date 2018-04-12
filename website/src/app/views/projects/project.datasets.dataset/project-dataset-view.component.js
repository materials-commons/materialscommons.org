class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            dataset: null,
        }
    }

    $onInit() {
        console.log('this.dataset', this.dataset);
    }

    $onChanges(changes) {
        if (changes.dataset) {
            this.state.dataset = angular.copy(changes.dataset.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController,
    bindings: {
        dataset: '<'
    }
});