class MCProcessFileUploadComponentController {
    /*@ngInject*/
    constructor(mcFlow, projectsService, toast, $stateParams, $timeout) {
        this.flow = mcFlow.get();
        this.projectsService = projectsService;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
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

        this.flow.on('catchAll', (eventName) => {
            this.$timeout(() => {
                if (eventName === 'complete') {
                    let fileIds = this.flow.files.map(f => f.file_id);
                    if (fileIds.length) {
                        this.onUploadComplete({fileIds: fileIds});
                        this.flow.files.length = 0;
                    }
                }
            });
        })
    }

    hasUploads() {
        return this.flow.files.length;
    }
}

angular.module('materialscommons').component('mcProcessFileUpload', {
    templateUrl: 'app/global.components/mc-process-file-upload.html',
    controller: MCProcessFileUploadComponentController,
    bindings: {
        onUploadComplete: '&'
    }
});
