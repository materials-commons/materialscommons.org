class MCProcessTemplateFilesListComponentController {
    /*@ngInject*/
    constructor(mcfile, isImage, showFileService) {
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.showFileService = showFileService;
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }
}

angular.module('materialscommons').component('mcProcessTemplateFilesList', {
    templateUrl: 'app/global.components/process/mc-process-template-files-list.html',
    controller: MCProcessTemplateFilesListComponentController,
    bindings: {
        inputFiles: '<',
        outputFiles: '<',
        files: '<'
    }
});
