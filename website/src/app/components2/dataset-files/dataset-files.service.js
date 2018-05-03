class DatasetFilesService {
    /*@ngInject*/
    constructor(selectItems) {
        this.selectItems = selectItems;
    }

    selectProjectFiles() {
        return this.selectItems.fileTree(true).then(selected => selected.files);
    }
}

angular.module('materialscommons').service('datasetFiles', DatasetFilesService);