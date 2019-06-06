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
            this.state.datasets.forEach(ds => {
                ds.hasFiles = false;
                if (ds.files.length) {
                    ds.hasFiles = true;
                } else {
                    let count = ds.file_selection.include_dirs.length + ds.file_selection.include_files.length;
                    ds.hasFiles = (count !== 0);
                }
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