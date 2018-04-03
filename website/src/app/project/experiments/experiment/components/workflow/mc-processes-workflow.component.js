class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor($stateParams, mcbus, mcstate, User, workflowState, experimentsAPI, toast) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.workflowState = workflowState;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;

        workflowState.setDataset(this.dataset);

        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.myName = 'MCProcessesWorkflow';
        this.showGraphView = true;
        this.currentTab = 0;
        this.showWorkspace = true;
        this.isBetaUser = User.isBetaUser();
        this.showSidebar = false;
        this.workspaceSize = 100;
    }

    $onInit() {
        this.mcbus.subscribe('WORKFLOW$VIEW', this.myName, (whichView) => {
            this.showGraphView = whichView === 'graph';
        });

        this.mcstate.subscribe('WORKSPACE$MAXIMIZED', this.myName, (maximized) => {
            this.showSidebar = !maximized;
            this.workspaceSize = this.showSidebar ? 65 : 100;
        });

        // this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
    }

    $onDestroy() {
        this.mcbus.leave('WORKFLOW$VIEW', this.myName);
        this.mcstate.leave('WORKSPACE$MAXIMIZED');
        // this.workflowState.leaveSelectedProcess(this.myName);
    }

    // onChange() {
    //     this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId)
    //         .then(
    //             (processes) => this.processes = processes,
    //             () => this.toast.error('Error retrieving processes for experiment')
    //         );
    // }
}

angular.module('materialscommons').component('mcProcessesWorkflow', {
    template: require('./mc-processes-workflow.html'),
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<',
        dataset: '='
    }
});
