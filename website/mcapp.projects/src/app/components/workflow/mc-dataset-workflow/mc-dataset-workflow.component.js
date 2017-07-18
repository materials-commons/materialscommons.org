class MCDatasetWorkflowComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;

        this.showWorkspace = true;
        this.showGraphView = true;
        this.myName = 'MCDatasetWorkflowComponentController';
        this.workspaceSize = 100;
    }

    $onInit() {
        this.mcbus.subscribe('WORKFLOW$VIEW', this.myName, (whichView) => {
            this.showGraphView = whichView === 'graph';
        });

        this.mcstate.subscribe('WORKSPACE$MAXIMIZED', this.myName, maximized => {
            this.showSidebar = !maximized;
            this.workspaceSize = this.showSidebar ? 65 : 100;
        })
    }

    $onDestroy() {
        this.mcbus.leave('WORKFLOW$VIEW', this.myName);
    }
}

angular.module('materialscommons').component('mcDatasetWorkflow', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow.html',
    controller: MCDatasetWorkflowComponentController,
    bindings: {
        dataset: '<'
    }
});