class MCFileUploaderComponentController {
    /*@ngInject*/
    constructor($stateParams, Upload, User, mcprojstore, gridFiles, $timeout) {
        this.$stateParams = $stateParams;
        this.Upload = Upload;
        this.User = User;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.files = [];
        this.uploadFiles = [];
        this.uploadInProgress = false;
        this.$timeout = $timeout;
        this.uploadMessage = '';
    }

    $onInit() {
        let project = this.mcprojstore.currentProject;
        const entry = this.gridFiles.findEntry(project.files[0], this.$stateParams.directory_id);
        this.path = entry.model.data.path;
    }

    remove(index) {
        this.files.splice(index, 1);
    }

    submit() {
        let {project_id, directory_id} = this.$stateParams;
        this.uploadFiles = this.files.map((f) => ({
            file: f,
            progress: 0
        }));
        this.uploadInProgress = true;
        P.map(this.uploadFiles, (f) => {
            return this.Upload.upload({
                url: `api/v2/projects/${project_id}/directories/${directory_id}/fileupload?apikey=${this.User.apikey()}`,
                data: {file: f.file}
            }).then(
                () => true,
                () => null,
                (evt) => {
                    f.progress = parseInt(100.0 * evt.loaded / evt.total);
                }
            )
        }, {concurrency: 3}).then(
            () => {
                this.$timeout(() => {
                    let uploadCount = this.uploadFiles.length;
                    this.uploadMessage = `Completed Upload of ${uploadCount} files.`;
                    this.uploadFiles.length = 0;
                    this.files.length = 0;
                    this.uploadInProgress = false;
                });
            }
        )
    }
}

angular.module('materialscommons').component('mcFileUploader', {
    templateUrl: 'app/project/files/components/mc-file-uploader.html',
    controller: MCFileUploaderComponentController,
});