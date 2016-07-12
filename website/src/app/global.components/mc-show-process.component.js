class MCShowProcessComponentController {
    /*@ngInject*/
    constructor($stateParams, projectsService, toast) {
        this.projectId = $stateParams.project_id;
        this.projectsService = projectsService;
        this.toast = toast;
    }

    $onInit() {
        this.projectsService.getProjectProcess(this.projectId, this.processId)
            .then(
                (process) => {
                    this.process = process;
                    this.files = process.input_files.concat(process.output_files);
                },
                () => this.toast.error('Unable to retrieve process details')
            );
    }
}

angular.module('materialscommons').component('mcShowProcess', {
    templateUrl: 'app/global.components/mc-show-process.html',
    controller: MCShowProcessComponentController,
    bindings: {
        processId: '<'
    }
});
