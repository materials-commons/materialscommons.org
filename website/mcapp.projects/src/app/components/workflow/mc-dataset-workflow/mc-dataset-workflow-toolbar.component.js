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
        this.mcbus.send('WORKFLOW$VIEW', 'graph');
    }

    showWorkflowOutline() {
        this.showingWorkflowGraph = false;
        this.mcbus.send('WORKFLOW$VIEW', 'outline');
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowToolbar', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-toolbar.html',
    controller: MCDatasetWorkflowToolbarComponentController
});