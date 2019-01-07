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
            this.state.datasets.forEach(d => {
                d.experiment_names = d.experiments.map(e => e.name).join(', ');
            });
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