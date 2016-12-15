class MCWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(workflowService, $timeout) {
        this.myName = "mcWorkflowToolbar";
        this.workflowService = workflowService;
        this.$timeout = $timeout;
        this.selectedProcess = null;
    }


    $onInit() {
        let cb = (selected) => this.$timeout(() => this.selectedProcess = selected);
        this.workflowService.addOnSelectCallback(this.myName, cb);
    }

    $onDestroy() {
        this.workflowService.deleteOnSelectCallback(this.myName);
    }
}

angular.module('materialscommons').component('mcWorkflowToolbar', {
    templateUrl: 'app/project/experiments/experiment/components/processes/mc-workflow-toolbar.html',
    controller: MCWorkflowToolbarComponentController,
});
