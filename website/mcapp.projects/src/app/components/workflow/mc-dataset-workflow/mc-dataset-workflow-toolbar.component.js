class MCDatasetWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate) {
        this.mcbus = mcbus;
        this.showingWorkflowGraph = true;
        this.mcstate = mcstate;
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

    search() {
        this.mcstate.set('WORKFLOW$SEARCH', this.query);
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowToolbar', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-toolbar.html',
    controller: MCDatasetWorkflowToolbarComponentController
});