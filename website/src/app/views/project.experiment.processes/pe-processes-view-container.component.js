class MCProjectExperimentProcessesViewContainerComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.state = {
            processes: [],
        };
    }

    $onInit() {
        this.experimentsAPI.getProcessesForExperiment2(this.experimentId, this.projectId).then(processes => this.state.processes = processes);
    }
}

angular.module('materialscommons').component('mcProjectExperimentProcessesViewContainer', {
    controller: MCProjectExperimentProcessesViewContainerComponentController,
    template: `<mc-processes-table processes="$ctrl.state.processes"></mc-processes-table>`
});