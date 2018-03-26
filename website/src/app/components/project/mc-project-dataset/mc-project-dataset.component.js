class MCProjectDatasetComponentController {
    /*@ngInject*/
    constructor() {
        this.grouped = false;
    }
}

angular.module('materialscommons').component('mcProjectDataset', {
    template: require('./mc-project-dataset.html'),
    controller: MCProjectDatasetComponentController
});