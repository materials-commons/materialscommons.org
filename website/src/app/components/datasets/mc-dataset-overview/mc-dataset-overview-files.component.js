class MCDatasetOverviewFilesComponentController {
    /*@ngInject*/
    constructor(User, isImage, mcfile) {
        this.User = User;
        this.isAuthenticated = User.isAuthenticated();
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
    }
}

angular.module('materialscommons').component('mcDatasetOverviewFiles', {
    template: require('./mc-dataset-overview-files.html'),
    controller: MCDatasetOverviewFilesComponentController,
    bindings: {
        dataset: '<'
    }
});
