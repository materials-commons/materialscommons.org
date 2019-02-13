class MCProjectProcessViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectId = $stateParams.project_id;
        this.processId = $stateParams.process_id;
        this.state = {
            process: null,
        };
    }

    $onInit() {
        this.projectsAPI.getProcessForProject(this.projectId, this.processId).then(process => this.state.process = process);
    }
}

angular.module('materialscommons').component('mcProjectProcessViewContainer', {
    controller: MCProjectProcessViewContainerComponentController,
    template: `<mc-project-process-view process="$ctrl.state.process" ng-if="$ctrl.state.process"></mc-project-process-view>`
});