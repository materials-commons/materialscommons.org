class MCDatasetsTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            datasets: []
        }
    }

    $onChanges(changes) {
        if (changes.datasets) {
            this.state.datasets = angular.copy(changes.datasets.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcDatasetsTable', {
    template: require('./datasets-table.html'),
    controller: MCDatasetsTableComponentController,
    bindings: {
        datasets: '<',
    }
});