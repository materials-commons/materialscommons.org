class MCProcessFileUploadComponentController {
    /*@ngInject*/
    constructor(projectsAPI, toast, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
    }

    $onInit() {
        this.dirs = [];
        this.dir = {data: ''};
        this.projectsAPI.getAllProjectDirectories(this.projectId).then(
            (dirs) => {
                this.dir.data = dirs[0];
                this.dirs = dirs;
            },
            () => this.toast.error('Unable to retrieve directories for project')
        );
    }

    uploadComplete(files) {
        if (files.length) {
            this.onUploadComplete({files: files});
        }
    }
}

angular.module('materialscommons').component('mcProcessFileUpload', {
    template: require('./mc-process-file-upload.html'),
    controller: MCProcessFileUploadComponentController,
    bindings: {
        onUploadComplete: '&'
    }
});
