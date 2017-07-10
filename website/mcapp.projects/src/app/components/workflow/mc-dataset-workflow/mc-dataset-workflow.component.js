class MCDatasetWorkflowComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate, workflowState, $filter, toast) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.workflowState = workflowState;
        this.$filter = $filter;
        this.toast = toast;

        this.removedNodes = null;
        this.showWorkspace = true;
        this.showGraphView = true;
        this.myName = 'MCDatasetWorkflowComponentController';
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
}

angular.module('materialscommons').component('mcDatasetWorkflow', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow.html',
    controller: MCDatasetWorkflowComponentController,
    bindings: {
        dataset: '<'
    }
});