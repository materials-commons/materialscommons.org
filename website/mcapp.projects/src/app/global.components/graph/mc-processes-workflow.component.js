class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor(experimentsService, processesService, templates, $stateParams, toast, $mdDialog, $timeout) {
        this.experimentsService = experimentsService;
        this.processesService = processesService;
        this.templates = templates;

        // Initialize callbacks to functions that do nothing. This cleans up the code
        // as we don't have to worry if its been set.
        this.deleteProcessCallback = () => null;
        this.onChangeCallback = () => null;
        this.addProcessCallback = () => null;

        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.$mdDialog = $mdDialog;
        this.selectedProcess = null;
        this.showGraphView = true;
        this.currentTab = 0;
        this.$timeout = $timeout;
    }

    addProcess(templateId) {
        this.experimentsService.createProcessFromTemplate(this.projectId, this.experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/global.components/graph/new-process-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewProcessDialogController,
                        bindToController: true,
                        locals: {
                            process: p
                        }
                    }).then(
                        () => {
                            this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                                .then(
                                    (processes) => {
                                        this.processes = processes;
                                        this.addProcessCallback(processes);
                                    },
                                    () => this.toast.error('Error retrieving processes for experiment')
                                );
                        }
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }

    setSelectedProcess(processId, hasChildren) {
        if (processId) {
            this.experimentsService.getProcessForExperiment(this.projectId, this.experimentId, processId)
                .then(
                    (process) => {
                        process.hasChildren = hasChildren;
                        this.selectedProcess = this.templates.loadProcess(process);
                        this.currentTab = 1;
                    },
                    () => {
                        this.toast.error('Unable to retrieve process details');
                        this.selectedProcess = null;
                    }
                );
        } else {
            this.selectedProcess = null;
            this.currentTab = 0;
        }
    }

    setDeleteProcessCallback(cb) {
        this.deleteProcessCallback = cb;
    }

    setOnChangeCallback(cb) {
        this.onChangeCallback = cb;
    }

    setAddProcessCallback(cb) {
        this.addProcessCallback = cb;
    }

    onChange() {
        this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
            .then(
                (processes) => {
                    this.processes = processes;
                    this.onChangeCallback();
                },
                () => this.toast.error('Error retrieving processes for experiment')
            );
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
                () => {
                    this.selectedProcess = null;
                    this.currentTab = 0;
                    this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                        .then(
                            (processes) => {
                                this.processes = processes;
                                this.deleteProcessCallback(processes);
                            },
                            () => this.toast.error('Error retrieving processes for experiment')
                        );
                },

                error => this.toast.error(error.data.error)
            );

    }
}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProcessesWorkflow', {
    templateUrl: 'app/global.components/graph/mc-processes-workflow.html',
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<'
    }
});
