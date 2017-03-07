class MCProcessTemplateFilesListComponentController {
    /*@ngInject*/
    constructor(mcfile, isImage, showFileService, processesAPI, toast, sampleLinker, samplesAPI, $stateParams) {
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.showFileService = showFileService;
        this.processesAPI = processesAPI;
        this.toast = toast;
        this.sampleLinker = sampleLinker;
        this.samplesAPI = samplesAPI;
        this.projectId = $stateParams.project_id;
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }

    removeFile(f) {
        this.processesAPI.updateFilesInProcess(this.projectId, this.process.id, [], [f.id]).then(
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

    linkFileToSamples(file) {
        let uniqueSamples = _.uniq(this.process.output_samples.concat(this.process.input_samples), 'id');
        this.sampleLinker.linkSamplesToFile(file, uniqueSamples).then(
            (linkedSamples) => linkedSamples.forEach(s => {
                let linkedFilesToAdd = [{id: file.id, name: file.name}];
                this.samplesAPI.updateSampleFiles(this.projectId, s.id, linkedFilesToAdd, []).then(
                    () => null,
                    () => this.toast.error('Unable to link sample to file')
                );
            })
        );
    }
}

angular.module('materialscommons').component('mcProcessTemplateFilesList', {
    templateUrl: 'app/global.components/process/mc-process-template-files-list.html',
    controller: MCProcessTemplateFilesListComponentController,
    bindings: {
        process: '='
    }
});
