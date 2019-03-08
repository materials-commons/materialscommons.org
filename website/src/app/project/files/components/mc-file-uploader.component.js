class MCFileUploaderComponentController {
    /*@ngInject*/
    constructor(Upload, User, $timeout, mcFileOpsDialogs) {
        this.Upload = Upload;
        this.User = User;
        this.files = [];
        this.uploadFiles = [];
        this.uploadInProgress = false;
        this.$timeout = $timeout;
        this.uploadMessage = '';
        this.uploaded = [];
        this.uploadFailures = [];
        this.mcFileOpsDialogs = mcFileOpsDialogs;
    }

    remove(index) {
        this.files.splice(index, 1);
    }

    $onChanges(changes) {
        if (changes.project) {
            this.projectId = changes.project.currentValue.id;
        }

        if (changes.dir) {
            this.dir = changes.dir.currentValue;
        }

        if (changes.path) {
            this.path = changes.path.currentValue;
        }
    }

    submit() {
        this.uploadFiles = this.files.map((f) => ({
            file: f,
            progress: 0
        }));
        this.uploadInProgress = true;
        this.uploadFailures = [];
        P.map(this.uploadFiles, (f) => {
            return this.Upload.upload({
                url: `api/v3/uploadFileToProjectDirectory`,
                data: {
                    file: f.file,
                    project_id: this.projectId,
                    directory_id: this.dir.id,
                    apikey: this.User.apikey(),
                }
            }).then(
                (uploaded) => {
                    this.uploaded.push(uploaded.data);
                },
                (e) => {
                    this.uploadFailures.push({
                        file: e.config.data.file.name,
                        reason: e.status === 413 ? "File too large" : e.statusText
                    });
                },
                (evt) => {
                    f.progress = 100.0 * evt.loaded / evt.total;
                }
            )
        }, {concurrency: 3}).then(
            () => {
                this.$timeout(() => {
                    let uploadCount = this.uploadFiles.length - this.uploadFailures.length;
                    this.uploadMessage = `Completed Upload of ${uploadCount} ${uploadCount === 1 ? 'file' : 'files'}.`;
                    this.uploadFiles.length = 0;
                    this.files.length = 0;
                    this.uploadInProgress = false;
                    if (this.onUploadComplete) {
                        let uploadedCopy = this.uploaded.slice();
                        this.onUploadComplete({dir: this.dir, files: uploadedCopy});
                    }
                    this.uploaded.length = 0;
                });
            }
        )
    }

    useGlobusForUpload() {
        this.mcFileOpsDialogs.uploadUsingGlobus(this.path).then(() => null);
    }
}

angular.module('materialscommons').component('mcFileUploader', {
    template: require('./mc-file-uploader.html'),
    controller: MCFileUploaderComponentController,
    bindings: {
        onUploadComplete: '&',
        path: '<',
        dir: '<',
        project: '<'
    }
});
