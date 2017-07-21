class MCProcessDetailsROFilesListComponentController {
    /*@ngInject*/
    constructor(User, isImage, mcfile) {
        this.isAuthenticated = User.isAuthenticated();
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
    }
}

angular.module('materialscommons').component('mcProcessDetailsRoFilesList', {
    templateUrl: 'app/components/process/mc-process-details-ro/mc-process-details-ro-files-list.html',
    controller: MCProcessDetailsROFilesListComponentController,
    bindings: {
        files: '<'
    }
});
