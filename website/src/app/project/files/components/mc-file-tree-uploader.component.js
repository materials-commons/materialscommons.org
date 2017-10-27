class MCFileTreeUploaderComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcFileTreeUploader', {
    templateUrl: 'app/project/files/components/mc-file-tree-uploader.html',
    controller: MCFileTreeUploaderComponentController,
    bindings: {
        path: '<',
        directoryId: '<',
        projectId: '<'
    }
});