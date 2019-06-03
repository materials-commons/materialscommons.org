class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor(datasetFiles) {
        this.datasetFiles = datasetFiles;
        this.state = {
            files: [],
            selection: {},
        };
    }

    $onChanges(changes) {
        if (changes.files) {
            this.state.files = angular.copy(changes.files.currentValue);
        }

        if (changes.selection) {
            this.state.selection = angular.copy(changes.selection.currentValue);
        }
    }

    selectFilesToAdd() {
        this.datasetFiles.selectProjectFiles(this.state.selection).then(files => this.onAddFiles({filesToAdd: files}));
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
        selection: '<',
        onRemoveFiles: '&',
        onAddFiles: '&'
    }
});