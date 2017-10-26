class MCFileUploaderComponentController {
    /*@ngInject*/
    constructor($stateParams, Upload, User, mcprojstore, gridFiles) {
        this.$stateParams = $stateParams;
        this.Upload = Upload;
        this.User = User;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.files = [];
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
        for (let i = 0; i < this.files.length; i++) {
            this.Upload.upload({
                url: `api/v2/projects/${project_id}/directories/${directory_id}/fileupload?apikey=${this.User.apikey()}`,
                data: {file: this.files[i]}
            });
        }
    }
}

angular.module('materialscommons').component('mcFileUploader', {
    templateUrl: 'app/project/files/components/mc-file-uploader.html',
    controller: MCFileUploaderComponentController,
});