class MCDatasetWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.showingWorkflowGraph = true;
    }

    toggleNavigator() {
        this.mcbus.send('WORKFLOW$NAVIGATOR');
    }

    showWorkflowGraph() {
        this.showingWorkflowGraph = true;
    }

    showWorkflowOutline() {
        this.showingWorkflowGraph = false;
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowToolbar', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-toolbar.html',
    controller: MCDatasetWorkflowToolbarComponentController
});