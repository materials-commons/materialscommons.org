class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController
});