class MCDatasetWorkflowComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.myName = 'MCDatasetWorkflowComponentController';
    }

    $onInit() {
        this.workspaceSize = 65;
        this.showSidebar = true;
        this.showGraphView = true;

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
        this.mcstate.leave('WORKSPACE$MAXIMIZED', this.myName);
    }
}

angular.module('materialscommons').component('mcDatasetWorkflow', {
    template: require('./mc-dataset-workflow.html'),
    controller: MCDatasetWorkflowComponentController,
    bindings: {
        dataset: '<'
    }
});
