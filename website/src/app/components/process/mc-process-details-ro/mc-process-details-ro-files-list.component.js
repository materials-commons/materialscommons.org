class MCProcessDetailsROFilesListComponentController {
    /*@ngInject*/
    constructor(User, isImage, mcfile) {
        this.isAuthenticated = User.isAuthenticated();
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
    }
}

angular.module('materialscommons').component('mcProcessDetailsRoFilesList', {
    template: require('./mc-process-details-ro-files-list.html'),
    controller: MCProcessDetailsROFilesListComponentController,
    bindings: {
        files: '<'
    }
});
