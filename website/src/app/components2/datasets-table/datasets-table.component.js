class MCDatasetsTableComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            datasets: []
        };
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

    handleDeleteDataset(dataset) {
        let confirmDeleteDialog = this.$mdDialog.confirm()
            .title(`Delete Dataset ${dataset.title}`)
            .textContent(`Delete dataset ${dataset.title}?`)
            .ariaLabel('delete dataset')
            .ok('Delete Dataset')
            .cancel('Cancel');

        this.$mdDialog.show(confirmDeleteDialog).then(
            () => this.onDatasetDelete({id: dataset.id})
        );
    }
}

angular.module('materialscommons').component('mcDatasetsTable', {
    template: require('./datasets-table.html'),
    controller: MCDatasetsTableComponentController,
    bindings: {
        datasets: '<',
        onDatasetDelete: '&',
    }
});