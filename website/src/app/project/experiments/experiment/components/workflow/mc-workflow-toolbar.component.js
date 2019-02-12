class MCWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(workflowService, workflowFiltersService, $timeout, $mdDialog, $stateParams, mcstate, mcbus,
                mcshow, mcprojstore, experimentsAPI) {
        this.myName = 'mcWorkflowToolbar';
        this.workflowService = workflowService;
        this.workflowFiltersService = workflowFiltersService;
        this.$timeout = $timeout;
        this.selectedProcess = null;
        this.$mdDialog = $mdDialog;
        this.mcstate = mcstate;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.mcbus = mcbus;
        this.mcshow = mcshow;
        this.mcprojstore = mcprojstore;
        this.experimentsAPI = experimentsAPI;
        this.query = '';
        this.showingWorkflowGraph = true;
        this.isMaximized = false;
        this.tooltipsEnabled = true;
    }

    $onInit() {
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROCESS, this.mcprojstore.EVSET, (process) => {
            this.selectedProcess = process;
        });
        //let cb = (selected) => this.$timeout(() => this.selectedProcess = selected);
        //this.mcstate.subscribe(this.mcstate.SELECTED$PROCESS, this.myName, cb);
        this.mcstate.set('WORKSPACE$MAXIMIZED', this.isMaximized);
    }

    $onDestroy() {
        this.unsubscribe();
        //this.mcstate.leave(this.mcstate.SELECTED$PROCESS, this.myName);
    }

    startIntro() {
        console.log('element', document.getElementById('wf-step-1'));
        introJs().addSteps([
            {
                element: document.getElementById('wf-step-1'),
                intro: 'The build tab is where you will choose process templates to build out your workflow.',
            },
            {
                element: document.getElementById('wf-step-2'),
                intro: 'The details tab allows you to add and view information about a process node. You can also add samples if your node is a create samples node.'
            },
            {
                element: document.getElementById('wf-step-3'),
                intro: 'You can apply filters to your graph to temporarily remove nodes.',
            },
            {
                element: document.getElementById('processesGraph'),
                intro: 'Your workflow graph will appear here. You can right-click on nodes in the graph to bring up a menu of actions.'
            },
        ]).start();
    }

    addProcess() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-process-templates-dialog.html',
            controller: SelectProcessTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true
        });
    }

    showWorkflowJson() {
        this.mcbus.send('WORKFLOW$SHOWJSON');
    }

    cloneProcess() {
        this.workflowService.cloneProcess(this.projectId, this.experimentId, this.selectedProcess);
    }

    deleteProcess() {
        this.workflowService.deleteNodeAndProcess(this.projectId, this.experimentId, this.selectedProcess.id);
        this.selectedProcess = null;
    }

    showSelectedProcess() {
        this.experimentsAPI.getProcessForExperiment(this.projectId, this.experimentId, this.selectedProcess.id).then(
                p => this.mcshow.processDetailsDialog(p, false)
            );
    }

    search() {
        this.mcstate.set('WORKFLOW$SEARCH', this.query);
    }

    reset() {
        this.query = '';
        this.mcbus.send('WORKFLOW$RESET');
    }

    restoreHiddenProcesses() {
        this.mcbus.send('WORKFLOW$RESTOREHIDDEN');
    }

    toggleNavigator() {
        this.mcbus.send('WORKFLOW$NAVIGATOR');
    }

    toggleTooltips() {
        this.tooltipsEnabled = !this.tooltipsEnabled;
        this.mcstate.set('WORKFLOW$TOOLTIPS', this.tooltipsEnabled);
    }

    showWorkflowGraph() {
        this.showingWorkflowGraph = true;
        this.mcbus.send('WORKFLOW$VIEW', 'graph');
    }

    showWorkflowOutline() {
        this.showingWorkflowGraph = false;
        this.mcbus.send('WORKFLOW$VIEW', 'outline');
    }

    filterBySamples() {
        this.workflowFiltersService.filterBySamples(this.projectId, this.experimentId);
    }

    toggleSidebar() {
        this.isMaximized = !this.isMaximized;
        this.mcstate.set('WORKSPACE$MAXIMIZED', this.isMaximized);
    }
}

class SelectProcessTemplateDialogController {
    /*@ngInject*/
    constructor($stateParams, $mdDialog, workflowService) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.workflowService = workflowService;
        this.keepOpen = false;
    }

    addSelectedProcessTemplate(templateId) {
        this.workflowService.addProcessFromTemplate(templateId, this.projectId, this.experimentId, this.keepOpen);
    }

    done() {
        this.$mdDialog.hide();
    }

}

angular.module('materialscommons').component('mcWorkflowToolbar', {
    template: require('./mc-workflow-toolbar.html'),
    controller: MCWorkflowToolbarComponentController
});
