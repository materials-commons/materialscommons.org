class MCDatasetOverviewFilesComponentController {
    /*@ngInject*/
    constructor(User, isImage, mcfile) {
        this.User = User;
        this.isAuthenticated = User.isAuthenticated();
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
        this.mcfile = mcfile;
    }

    downloadSrc(file) {
        return this.mcfile.downloadSrc(file.original_id);
    }
}

angular.module('materialscommons').component('mcDatasetOverviewFiles', {
    template: require('./mc-dataset-overview-files.html'),
    controller: MCDatasetOverviewFilesComponentController,
    bindings: {
        dataset: '<'
    }
});
