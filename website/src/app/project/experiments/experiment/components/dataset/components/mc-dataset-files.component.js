class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDatasetFiles', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-files.html',
    controller: MCDatasetFilesComponentController,
    bindings: {
        files: '<'
    }
});
