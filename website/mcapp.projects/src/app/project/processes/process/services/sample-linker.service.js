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
            templateUrl: 'app/project/processes/process/services/link-files-to-sample.html',
            controller: LinkFilesToSampleController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true,
            locals: {
                sample: sample,
                files: files
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

    linkFile(file) {
        file.linked = true;
        let i = _.findIndex(this.filesToLink, f => f.id == file.id && f.sample_id == file.sample_id);
        if (i !== -1) {
            let f = this.filesToLink[i];
            f.id = file.id;
            f.command = 'add';
            f.name = file.name;
            f.linked = file.linked;
            f.sample_id = this.sample.id;
        } else {
            this.filesToLink.push({
                id: file.id,
                command: 'add',
                name: file.name,
                linked: file.linked,
                sample_id: this.sample_id
            });
        }
    }

    unlinkFile(file) {
        file.linked = false;
        let i = _.findIndex(this.filesToLink, f => f.id == file.id && f.sample_id == file.sample_id);
        if (i !== -1) {
            let f = this.filesToLink[i];
            f.id = file.id;
            f.command = 'delete';
            f.name = file.name;
            f.linked = file.linked;
            f.sample_id = this.sample.id;
        }
    }

    linkAllFiles() {
        this.filesToLink = [];
        this.files.forEach(f => this.linkFile(f));
    }

    unlinkAllFiles() {
        this.files.forEach(f => this.unlinkFile(f));
    }
}

angular.module('materialscommons').service('sampleLinker', SampleLinkerService);