class MCDatasetWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate, publicDatasetsAPI, mcshow, $timeout) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.publicDatasetsAPI = publicDatasetsAPI;
        this.mcshow = mcshow;
        this.$timeout = $timeout;
        this.showingWorkflowGraph = true;
        this.myName = 'MCDatasetWorkflowToolbar';
        this.isMaximized = false;
    }

    $onInit() {
        let cb = (selected) => this.$timeout(() => {
            this.selectedProcess = selected;
        });
        this.mcstate.subscribe(this.mcstate.SELECTED$PROCESS, this.myName, cb);
        this.mcstate.set('WORKSPACE$MAXIMIZED', this.isMaximized);
    }

    $onDestroy() {
        this.mcstate.leave(this.mcstate.SELECTED$PROCESS, this.myName);
    }

    showSelectedProcess() {
        this.publicDatasetsAPI.getDatasetProcess(this.dataset.id, this.selectedProcess.id).then(
            p => this.mcshow.processDetailsDialogRO(p, false)
        );
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

    toggleSidebar() {
        this.isMaximized = !this.isMaximized;
        this.mcstate.set('WORKSPACE$MAXIMIZED', this.isMaximized);
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowToolbar', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-toolbar.html',
    controller: MCDatasetWorkflowToolbarComponentController
});