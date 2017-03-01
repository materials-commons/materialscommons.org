class MCShowProcessComponentController {
    /*@ngInject*/
    constructor($stateParams, projectsAPI, toast) {
        this.projectId = $stateParams.project_id;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    $onInit() {
        this.projectsAPI.getProjectProcess(this.projectId, this.processId)
            .then(
                (process) => this.process = process,
                () => this.toast.error('Unable to retrieve process details')
            );
    }
}

angular.module('materialscommons').component('mcShowProcess', {
    templateUrl: 'app/global.components/mc-show-process.html',
    controller: MCShowProcessComponentController,
    bindings: {
        processId: '<',
        showInputSamples: '<',
        showOutputSamples: '<'
    }
});
