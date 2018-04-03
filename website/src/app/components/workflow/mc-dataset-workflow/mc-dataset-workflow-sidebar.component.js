class MCDatasetWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor(workflowState) {
        this.workflowState = workflowState;
        this.myName = 'MCDatasetWorkflowSidebar';
        this.selectedProcess = null;
    }

    $onInit() {
        this.workflowState.subscribeSelectedProcess(this.myName, process => {
            this.selectedProcess = process;
        });
    }

    $onDestroy() {
        this.workflowState.leaveSelectedProcess(this.myName);
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowSidebar', {
    template: require('./mc-dataset-workflow-sidebar.html'),
    controller: MCDatasetWorkflowSidebarComponentController,
    bindings: {
        dataset: '<'
    }
});
