class MCFilesTableComponentController {
    /*@ngInject*/
    constructor(isImage, mcfile) {
        this.isFileImage = isImage;
        this.mcfile = mcfile;
    }

    fileSrc(fileId) {
        return this.mcfile.src(fileId);
    }

    isImage(mime) {
        return this.isFileImage(mime);
    }
}

angular.module('materialscommons').component('mcFilesTable', {
    templateUrl: 'app/global.components/mc-files-table.html',
    controller: MCFilesTableComponentController,
    bindings: {
        files: '<'
    }
});
