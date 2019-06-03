class DatasetFilesService {
    /*@ngInject*/
    constructor(selectItems) {
        this.selectItems = selectItems;
    }

    selectProjectFiles(selection) {
        return this.selectItems.fileTree2(selection).then(selected => selected);
    }
}

angular.module('materialscommons').service('datasetFiles', DatasetFilesService);