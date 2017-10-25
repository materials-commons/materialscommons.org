class MCFileUploaderComponentController {
    /*@ngInject*/
    constructor($stateParams, Upload, User) {
        this.$stateParams = $stateParams;
        this.Upload = Upload;
        this.User = User;
        this.files = [];
    }

    submit() {
        let {project_id, directory_id} = this.$stateParams;
        this.Upload.upload({
            url: `api/v2/projects/${project_id}/directories/${directory_id}/fileupload?apikey=${this.User.apikey()}`,
            data: {file: this.files[0]}
        });
    }
}

angular.module('materialscommons').component('mcFileUploader', {
    templateUrl: 'app/project/files/components/mc-file-uploader.html',
    controller: MCFileUploaderComponentController,
});