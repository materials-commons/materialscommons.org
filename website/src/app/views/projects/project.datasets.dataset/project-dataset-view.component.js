class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor (datasetsAPI) {
        this.datasetsAPI = datasetsAPI
        this.state = {
            dataset: null,
        }
    }

    $onChanges(changes) {
        if (changes.dataset) {
            this.state.dataset = angular.copy(changes.dataset.currentValue);
        }
    }

    publishDataset () {
        this.onPublishDataset()
    }

    handleDeleteFiles(filesToDelete) {
        this.onDeleteFiles({filesToDelete: filesToDelete});
    }

    handleAddFiles(filesToAdd) {
        this.onAddFiles({filesToAdd: filesToAdd});
    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController,
    bindings: {
        dataset: '<',
        onDeleteFiles: '&',
        onAddFiles: '&',
        onPublishDataset: '&',
    }
});