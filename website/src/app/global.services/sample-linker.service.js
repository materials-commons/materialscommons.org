class SampleLinkerService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    linkFilesToSample(sample, input_files, output_files) {
        let allFiles = input_files.concat(output_files);
        let linkedFilesById = _.indexBy(sample.files, 'id');
        let files = allFiles.map(f => {
            f.linked = (f.id in linkedFilesById);
            return f;
        });
        return this.$mdDialog.show({
            templateUrl: 'app/modals/link-files-to-sample-dialog.html',
            controller: LinkFilesToSampleController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true,
            locals: {
                sample: sample,
                files: files
            }
        });
    }

    linkSamplesToFile(file, samples) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/link-samples-to-file-dialog.html',
            controller: LinkSamplesToFileController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true,
            locals: {
                samples: samples,
                file: file
            }
        });
    }
}

class LinkFilesToSampleController {
    /*@ngInject*/
    constructor($mdDialog, isImage, mcfile) {
        this.$mdDialog = $mdDialog;
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
        this.filesToLink = this.files.map(f => ({id: f.id, name: f.name, linked: f.linked, mediatype: f.mediatype}));
        this.selected = [];
    }

    done() {
        this.$mdDialog.hide(this.filesToLink);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class LinkSamplesToFileController {
    /*@ngInject*/
    constructor($mdDialog, isImage, mcfile, showFileService) {
        this.$mdDialog = $mdDialog;
        this.isImage = isImage;
        this.fileSrc = mcfile.src;
        this.showFileService = showFileService;
        this.samplesToLink = this.samples.map(s => ({id: s.id, name: s.name, linked: s.linked}));
        this.selected = [];
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }

    done() {
        this.$mdDialog.hide(this.samplesToLink);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('sampleLinker', SampleLinkerService);
