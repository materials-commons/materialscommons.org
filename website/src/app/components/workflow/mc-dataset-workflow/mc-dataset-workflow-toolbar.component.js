class MCDatasetWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(mcbus, mcstate, publicDatasetsAPI, mcshow, $timeout, $stateParams) {
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.publicDatasetsAPI = publicDatasetsAPI;
        this.mcshow = mcshow;
        this.$timeout = $timeout;
        this.showingWorkflowGraph = true;
        this.myName = 'MCDatasetWorkflowToolbar';
        this.isMaximized = false;
        this.$stateParams = $stateParams;
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
        this.publicDatasetsAPI.getDatasetProcess(this.$stateParams.dataset_id, this.selectedProcess.id).then(
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

    restoreHidden() {
        this.mcbus.send('WORKFLOW$RESTOREHIDDEN');
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
    template: require('./mc-dataset-workflow-toolbar.html'),
    controller: MCDatasetWorkflowToolbarComponentController
});
