class MCShowFileComponentController {
    /*@ngInject*/
    constructor(projectsAPI, toast, $stateParams) {
        this.projectId = $stateParams.project_id;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    $onInit() {
        this.projectsAPI.getProjectFile(this.projectId, this.fileId)
            .then(
                (file) => this.file = file,
                () => this.toast.error('Unable to retrieve file details')
            );
    }
}

angular.module('materialscommons').component('mcShowFile', {
    templateUrl: 'app/global.components/mc-show-file.html',
    controller: MCShowFileComponentController,
    bindings: {
        fileId: '<'
    }
});