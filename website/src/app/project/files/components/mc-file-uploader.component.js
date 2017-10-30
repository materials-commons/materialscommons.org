class MCFileUploaderComponentController {
    /*@ngInject*/
    constructor(Upload, User, $timeout) {
        this.Upload = Upload;
        this.User = User;
        this.files = [];
        this.uploadFiles = [];
        this.uploadInProgress = false;
        this.$timeout = $timeout;
        this.uploadMessage = '';
        this.uploaded = [];
    }

    remove(index) {
        this.files.splice(index, 1);
    }

    submit() {
        this.uploadFiles = this.files.map((f) => ({
            file: f,
            progress: 0
        }));
        this.uploadInProgress = true;
        P.map(this.uploadFiles, (f) => {
            return this.Upload.upload({
                url: `api/v2/projects/${this.projectId}/directories/${this.directoryId}/fileupload?apikey=${this.User.apikey()}`,
                data: {file: f.file}
            }).then(
                (uploaded) => {
                    this.uploaded.push(uploaded.data);
                },
                () => null,
                (evt) => {
                    f.progress = parseInt(100.0 * evt.loaded / evt.total);
                }
            )
        }, {concurrency: 3}).then(
            () => {
                this.$timeout(() => {
                    let uploadCount = this.uploadFiles.length;
                    this.uploadMessage = `Completed Upload of ${uploadCount} ${uploadCount === 1 ? 'file' : 'files'}.`;
                    this.uploadFiles.length = 0;
                    this.files.length = 0;
                    this.uploadInProgress = false;
                    if (this.onUploadComplete) {
                        let uploadedCopy = this.uploaded.slice();
                        this.onUploadComplete({files: uploadedCopy});
                    }
                    this.uploaded.length = 0;
                });
            }
        )
    }
}

angular.module('materialscommons').component('mcFileUploader', {
    templateUrl: 'app/project/files/components/mc-file-uploader.html',
    controller: MCFileUploaderComponentController,
    bindings: {
        onUploadComplete: '&',
        path: '<',
        directoryId: '<',
        projectId: '<'
    }
});