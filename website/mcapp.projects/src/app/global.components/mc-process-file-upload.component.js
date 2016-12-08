class MCProcessFileUploadComponentController {
    /*@ngInject*/
    constructor(mcFlow, projectsService, toast, $stateParams) {
        this.flow = mcFlow.get();
        this.projectsService = projectsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.dir = {
            data: {
                id: 'da79ca63-eefb-48e6-a661-095fb64bee10',
                name: 'Test2'
            }
        }
    }

    $onInit() {
        this.dirs = [];
        this.dir = {data: ''};
        this.projectsService.getAllProjectDirectories(this.$stateParams.project_id).then(
            (dirs) => {
                this.dir.data = dirs[0];
                this.dirs = dirs;
            },
            () => this.toast.error('Unable to retrieve directories for project')
        );
    }

    hasUploads() {
        return this.flow.files.length;
    }
}

angular.module('materialscommons').component('mcProcessFileUpload', {
    templateUrl: 'app/global.components/mc-process-file-upload.html',
    controller: MCProcessFileUploadComponentController
});
