class MCProcessTemplateFilesListComponentController {
    /*@ngInject*/
    constructor(mcfile, isImage, showFileService, processesAPI, toast, sampleLinker, samplesAPI, $stateParams, mcshow) {
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.showFileService = showFileService;
        this.processesAPI = processesAPI;
        this.toast = toast;
        this.sampleLinker = sampleLinker;
        this.samplesAPI = samplesAPI;
        this.mcshow = mcshow;
        this.projectId = $stateParams.project_id;
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }

    showSample(sample) {
        this.mcshow.sampleDialog(sample);
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
                    () => this.updateProcessSamples(s.id, linkedFilesToAdd),
                    () => this.toast.error('Unable to link sample to file')
                );
            })
        );
    }

    updateProcessSamples(sampleId, filesToAdd) {
        let iInput = _.indexOf(this.process.input_samples, s => s.id === sampleId),
            iOutput = _.indexOf(this.process.output_samples, s => s.id === sampleId),
            s;

        if (iInput !== -1) {
            s = this.process.input_samples[iInput];
            s.files = _.uniq(s.files.concat(filesToAdd), 'id');
        }

        if (iOutput !== -1) {
            s = this.process.output_samples[iOutput];
            s.files = _.uniq(s.files.concat(filesToAdd), 'id');
        }
    }
}

angular.module('materialscommons').component('mcProcessTemplateFilesList', {
    template: require('./mc-process-template-files-list.html'),
    controller: MCProcessTemplateFilesListComponentController,
    bindings: {
        process: '='
    }
});
