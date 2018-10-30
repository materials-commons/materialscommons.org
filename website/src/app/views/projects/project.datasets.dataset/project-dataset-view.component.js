class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor(datasetsAPI) {
        this.datasetsAPI = datasetsAPI;
        this.state = {
            dataset: null,
        };
    }

    $onChanges(changes) {
        if (changes.dataset) {
            this.state.dataset = changes.dataset.currentValue; //angular.copy(changes.dataset.currentValue);
        }
    }

    handleDeleteFiles(filesToDelete) {
        this.onDeleteFiles({filesToDelete: filesToDelete});
    }

    handleAddFiles(filesToAdd) {
        this.onAddFiles({filesToAdd: filesToAdd});
    }

    handleUpdateDataset(dataset) {
        this.onUpdateDataset({dataset: dataset});
    }

    handlePublishDataset() {
        this.onPublishDataset();
    }

    handleUnpublishDataset() {
        this.onUnpublishDataset();
    }

    handleAddDOI(doiDetails) {
        this.onAddDoi({doiDetails: doiDetails});
    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController,
    bindings: {
        dataset: '<',
        onDeleteFiles: '&',
        onAddFiles: '&',
        onUpdateDataset: '&',
        onPublishDataset: '&',
        onUnpublishDataset: '&',
        onAddDoi: '&',
    }
});