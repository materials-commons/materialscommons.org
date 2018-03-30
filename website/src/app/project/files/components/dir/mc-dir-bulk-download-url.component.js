class MCDirBulkDownloadUrlComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        this.downloadMessageFlash = '';
    }
}

angular.module('materialscommons').component('mcDirBulkDownloadUrl', {
    template: require('./mc-dir-bulk-download-url.html'),
    controller: MCDirBulkDownloadUrlComponentController,
    bindings: {
        downloadState: '<',
        downloadUrl: '<'
    }
});
