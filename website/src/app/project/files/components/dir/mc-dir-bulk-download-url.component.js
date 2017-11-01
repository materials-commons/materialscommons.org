class MCDirBulkDownloadUrlComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        this.downloadMessageFlash = '';
    }
}

angular.module('materialscommons').component('mcDirBulkDownloadUrl', {
    templateUrl: 'app/project/files/components/dir/mc-dir-bulk-download-url.html',
    controller: MCDirBulkDownloadUrlComponentController,
    bindings: {
        downloadState: '<',
        downloadUrl: '<'
    }
});