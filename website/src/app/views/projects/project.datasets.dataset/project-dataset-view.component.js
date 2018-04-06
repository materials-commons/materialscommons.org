class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        console.log('this.dataset', this.dataset);
    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController,
    bindings: {
        dataset: '<'
    }
});