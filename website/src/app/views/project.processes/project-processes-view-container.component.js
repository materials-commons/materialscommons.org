class MCProjectProcessesViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectId = $stateParams.project_id;
        this.state = {
            processes: [],
        };
    }

    $onInit() {
        this.projectsAPI.getProcessesForProject(this.projectId).then(processes => this.state.processes = processes);
    }
}

angular.module('materialscommons').component('mcProjectProcessesViewContainer', {
    controller: MCProjectProcessesViewContainerComponentController,
    template: `<mc-processes-table processes="$ctrl.state.processes"></mc-processes-table>`
});

