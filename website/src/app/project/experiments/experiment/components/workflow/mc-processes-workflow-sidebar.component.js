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
    }

    $onInit() {
        //this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROCESS, this.mcprojstore.EVSET,
            process => {
                this.$timeout(() => this.selectedProcess = process);
            });
        this.unsubscribeDelete = this.mcprojstore.subscribe(this.mcprojstore.OTPROCESS, this.mcprojstore.EVREMOVE,
            () => this.$timeout(() => this.selectedProcess = null));
    }

    $onDestroy() {
        //this.workflowState.leaveSelectedProcess(this.myName);
        this.unsubscribe();
        this.unsubscribeDelete();
    }

    addToGraph(template) {
        this.workflowService.addProcessFromTemplateNoPopup(template.name, this.projectId, this.experimentId);
    }
}

angular.module('materialscommons').component('mcProcessesWorkflowSidebar', {
    template: require('./mc-processes-workflow-sidebar.html'),
    controller: MCProcessesWorkflowSidebarComponentController
});
