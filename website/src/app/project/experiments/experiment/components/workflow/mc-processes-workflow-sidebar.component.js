class MCProcessesWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor(workflowState, templates, workflowService, mcprojstore, $timeout, $stateParams) {
        this.workflowState = workflowState;
        this.workflowService = workflowService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.templates = templates.get();
        this.selectedProcess = null;
        this.mcprojstore = mcprojstore;
        this.$timeout = $timeout;
        //this.myName = 'MCProcessesWorkflowSidebar';
    }

    $onInit() {
        //this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROCESS, this.mcprojstore.EVSET,
            process => {
                this.$timeout(() => this.selectedProcess = process);
            });
    }

    $onDestroy() {
        //this.workflowState.leaveSelectedProcess(this.myName);
        this.unsubscribe();
    }

    addToGraph(template) {
        this.workflowService.addProcessFromTemplateNoPopup(template.name, this.projectId, this.experimentId);
    }
}

angular.module('materialscommons').component('mcProcessesWorkflowSidebar', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-sidebar.html',
    controller: MCProcessesWorkflowSidebarComponentController
});
