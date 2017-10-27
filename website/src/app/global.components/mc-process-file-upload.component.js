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
        let fileIds = files.map(f => f.id);
        if (fileIds.length) {
            this.onUploadComplete({fileIds: fileIds});
        }
    }
}

angular.module('materialscommons').component('mcProcessFileUpload', {
    templateUrl: 'app/global.components/mc-process-file-upload.html',
    controller: MCProcessFileUploadComponentController,
    bindings: {
        onUploadComplete: '&'
    }
});
