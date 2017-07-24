class MCProcessesWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor(workflowState, templatesAPI, workflowService, $stateParams) {
        this.workflowState = workflowState;
        this.templatesAPI = templatesAPI;
        this.workflowService = workflowService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.selectedProcess = null;
        this.myName = 'MCProcessesWorkflowSidebar';
    }

    $onInit() {
        this.workflowState.subscribeSelectedProcess(this.myName, (process) => this.selectedProcess = process);
        this.templatesAPI.getAllTemplates().then(
            templates => this.templates = templates
        );
    }

    $onDestroy() {
        this.workflowState.leaveSelectedProcess(this.myName);
    }

    addToGraph(template) {
        this.workflowService.addProcessFromTemplateNoPopup(template.name, this.projectId, this.experimentId);
    }
}

angular.module('materialscommons').component('mcProcessesWorkflowSidebar', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-sidebar.html',
    controller: MCProcessesWorkflowSidebarComponentController
});
