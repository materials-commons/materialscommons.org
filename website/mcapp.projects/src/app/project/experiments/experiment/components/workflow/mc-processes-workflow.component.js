class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor($stateParams, mcbus, User, workflowState, experimentsAPI) {
        this.mcbus = mcbus;
        this.workflowState = workflowState;
        this.experimentsAPI = experimentsAPI;

        workflowState.setDataset(this.dataset);

        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.myName = 'MCProcessesWorkflow';
        this.showGraphView = true;
        this.currentTab = 0;
        this.showWorkspace = true;
        this.isBetaUser = User.isBetaUser();
    }

    $onInit() {
        this.mcbus.subscribe('WORKFLOW$VIEW', this.myName, (whichView) => {
            this.showGraphView = whichView === 'graph';
        });

        this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
    }

    $onDestroy() {
        this.mcbus.leave('WORKFLOW$VIEW', this.myName);
        this.workflowState.leaveSelectedProcess(this.myName);
    }

    onChange() {
        this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId)
            .then(
                (processes) => this.processes = processes,
                () => this.toast.error('Error retrieving processes for experiment')
            );
    }
}

angular.module('materialscommons').component('mcProcessesWorkflow', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow.html',
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<',
        dataset: '='
    }
});
