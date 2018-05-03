class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor(datasetFiles) {
        this.datasetFiles = datasetFiles;
        this.state = {
            files: []
        };
    }

    $onChanges(changes) {
        if (changes.files) {
            this.state.files = angular.copy(changes.files.currentValue);
        }
    }

    addFiles() {
        this.datasetFiles.addFiles().then(
            files => this.onAddFiles({filesToAdd: files})
        );
    }

    selectFiles() {
        this.datasetFiles.selectProjectFiles(true).then(files => console.log(files));
    }

    removeSelectedFiles() {
        let filesToDelete = this.state.files.filter(f => f.selected);
        this.onRemoveFiles({filesToDelete: filesToDelete});
    }
}

angular.module('materialscommons').component('mcDatasetFiles', {
    template: require('./dataset-files.html'),
    controller: MCDatasetFilesComponentController,
    bindings: {
        files: '<',
        onRemoveFiles: '&',
        onAddFiles: '&'
    }
});