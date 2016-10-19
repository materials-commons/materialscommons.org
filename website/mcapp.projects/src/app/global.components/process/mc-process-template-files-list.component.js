class MCProcessTemplateFilesListComponentController {
    /*@ngInject*/
    constructor(mcfile, isImage, showFileService, processesService, toast, $stateParams) {
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.showFileService = showFileService;
        this.processesService = processesService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }

    removeFile(f) {
        this.processesService.updateFilesInProcess(this.projectId, this.process.id, [], [f.id]).then(
            () => this.removeFileFromProcess(f),
            () => this.toast.error('Unable to remove file from process')
        );
    }

    removeFileFromProcess(file) {
        let i = _.findIndex(this.process.files, (f) => f.id === file.id);
        if (i !== -1) {
            this.process.files.splice(i, 1);
        }
    }
}

angular.module('materialscommons').component('mcProcessTemplateFilesList', {
    templateUrl: 'app/global.components/process/mc-process-template-files-list.html',
    controller: MCProcessTemplateFilesListComponentController,
    bindings: {
        process: '='
    }
});
