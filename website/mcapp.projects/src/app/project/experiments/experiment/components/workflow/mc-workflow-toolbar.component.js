class MCWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(workflowService, workflowService2, $timeout, $mdDialog, $stateParams) {
        this.myName = "mcWorkflowToolbar";
        this.workflowService = workflowService;
        this.workflowService2 = workflowService2;
        this.$timeout = $timeout;
        this.selectedProcess = null;
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }


    $onInit() {
        let cb = (selected) => this.$timeout(() => this.selectedProcess = selected);
        this.workflowService.addOnSelectCallback(this.myName, cb);
    }

    $onDestroy() {
        this.workflowService.deleteOnSelectCallback(this.myName);
    }

    addProcess() {
        console.log('addProcess');
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/workflow/mc-process-templates-dialog.html',
            controller: SelectProcessTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true
        });
    }

    deleteProcess() {
        this.workflowService2.deleteNodeAndProcess(this.projectId, this.experimentId, this.selectedProcess.id);
        this.selectedProcess = null;
    }

}

class SelectProcessTemplateDialogController {
    /*@ngInject*/
    constructor($stateParams, $mdDialog, workflowService2) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.workflowService2 = workflowService2;
    }

    addSelectedProcessTemplate(templateId) {
        this.workflowService2.addProcessFromTemplate(templateId, this.projectId, this.experimentId)
    }

    done() {
        this.$mdDialog.hide();
    }

}

angular.module('materialscommons').component('mcWorkflowToolbar', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-toolbar.html',
    controller: MCWorkflowToolbarComponentController
});
