class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor(experimentsService, processesService, templates) {
        this.experimentsService = experimentsService;
        this.processesService = processesService;
        this.templates = templates;
        this.deleteProcessCallback = null;
        this.onChangeCallback = null;
    }

    setSelectedProcess(processId, hasChildren) {
        this.experimentsService.getProcessForExperiment(this.projectId, this.experimentId, processId)
            .then(
                (process) => {
                    process.hasChildren = hasChildren;
                    this.selectedProcess = this.templates.loadProcess(process);
                    this.currentTab = 2;
                },
                () => {
                    this.toast.error('Unable to retrieve process details');
                    this.selectedProcess = null;
                }
            );
    }

    setDeleteProcessCallback(cb) {
        this.deleteProcessCallback = cb;
    }

    setOnChangeCallback(cb) {
        this.onChangeCallback = cb;
    }

    onChange() {
        this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
            .then(
                (processes) => {
                    this.processes = processes;
                    if (this.onChangeCallback) {
                        this.onChangeCallback();
                    }
                },
                () => this.toast.error('Error retrieving processes for experiment')
            );
    }

    processNodeIsDeletable() {
        return this.selectedProcess ? this.selectedProcess.hasChildren : false;
    }

    deleteNodeAndProcessConfirm() {
        this.processesService.getDeleteProcessPreConditions(this.projectId, this.selectedProcess.id)
            .then(
                process => {
                    let numberOfSamples = process.output_samples.length;
                    if (numberOfSamples == 0) {
                        this.deleteNodeAndProcess();
                    } else {
                        this.confirmAndDeleteProcess(process);
                    }
                },
                error => this.toast.error(error.data.error)
            );
    }

    confirmAndDeleteProcess(process) {
        let processName = process.name;
        let numberOfSamples = process.output_samples.length;
        let samples = " output sample" + ((numberOfSamples != 1) ? "s" : "");
        let processInfo = processName + " - has " + numberOfSamples + samples + ".";
        let confirm = this.$mdDialog.confirm()
            .title('This process has output samples: Delete node and Samples?')
            .textContent(processInfo)
            .ariaLabel('Please confirm - deleting node')
            .ok('Delete')
            .cancel('Cancel');

        this.$mdDialog.show(confirm).then(() => this.deleteNodeAndProcess());
    }

    deleteNodeAndProcess() {
        //NOTE: currently the graph is redisplayed after the process is deleted;
        // so, currently we do not delete the node from the graph itself; the problem
        // with this approach is that redrawing the graph "blows away"
        // any local layout that the user has created. Hence, this needs to be
        // updated so that only the process is deleted, and the node is deleted
        // from the graph without disturding the layout. Terry Weymouth - Sept 29, 2016
        this.processesService.deleteProcess(this.projectId, this.selectedProcess.id)
            .then(
                () =>
                    this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                        .then(
                            (processes) => {
                                this.processes = processes;
                                if (this.deleteProcessCallback) {
                                    this.deleteProcessCallback(this.selectedProcess);
                                }
                            },
                            () => this.toast.error('Error retrieving processes for experiment')
                        ),

                error => this.toast.error(error.data.error)
            );

    }
}

angular.module('materialscommons').component('mcProcessesWorkflow', {
    templateUrl: 'app/global.components/graph/mc-processes-workflow.html',
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<'
    }
});
