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

    submit() {
        this.uploadFiles = this.files.map((f) => ({
            file: f,
            progress: 0
        }));
        this.uploadInProgress = true;
        this.uploadFailures = [];
        P.map(this.uploadFiles, (f) => {
            return this.Upload.upload({
                url: `api/v2/projects/${this.projectId}/directories/${this.directoryId}/fileupload?apikey=${this.User.apikey()}`,
                data: {file: f.file}
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
                        this.onUploadComplete({files: uploadedCopy});
                    }
                    this.uploaded.length = 0;
                });
            }
        )
    }

    useGlobusForUpload() {
        console.log("useGlobusForUpload", this.path, this.directoryId);
        this.mcFileOpsDialogs.uploadUsingGlobus(this.path).then(globusNameOrID => {
            console.log("Would upload using Globus", globusNameOrID, this.path, this.directoryId);
        });
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