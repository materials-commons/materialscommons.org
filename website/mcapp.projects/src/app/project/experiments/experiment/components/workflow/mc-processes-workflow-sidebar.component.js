class MCProcessesWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor(workflowState) {
        this.workflowState = workflowState;
        this.selectedProcess = null;
    }

    $onInit() {
        this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
    }
}

angular.module('materialscommons').component('mcProcessesWorkflowSidebar', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-sidebar.html',
    controller: MCProcessesWorkflowSidebarComponentController
});
