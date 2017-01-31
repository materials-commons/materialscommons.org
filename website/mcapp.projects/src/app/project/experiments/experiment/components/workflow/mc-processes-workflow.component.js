class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor(experimentsService, processesService, templates, $stateParams, toast, $mdDialog,
                $timeout, experimentProcessesService, datasetService, workflowService, mcbus) {
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
        this.datasetId = $stateParams.dataset_id;
        this.$mdDialog = $mdDialog;
        this.selectedProcess = null;
        this.showGraphView = true;
        this.currentTab = 0;
        this.$timeout = $timeout;
        this.experimentProcessesService = experimentProcessesService;
        this.datasetService = datasetService;
        this.workflowService = workflowService;
        this.mcbus = mcbus;

        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
    }

    $onInit() {
        let onChangeCB = () => this.onChange();
        this.workflowService.setWorkflowChangeCallback(onChangeCB);
    }

    $onDestroy() {
        this.workflowService.clearWorkflowChangeCallbacks();
    }

    addProcess(templateId) {
        this.experimentsService.createProcessFromTemplate(this.projectId, this.experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/project/experiments/experiment/components/workflow/new-process-dialog.html',
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
                                        //this.addProcessCallback(processes);
                                        this.mcbus.send('ADD$PROCESS', processes);
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
                        this.selectedProcess = process;
                        this.workflowService.callOnSelectCallbacks(process);
                        this.currentTab = 1;
                    },
                    () => {
                        this.toast.error('Unable to retrieve process details');
                        this.selectedProcess = null;
                        this.workflowService.callOnSelectCallbacks(null);
                    }
                );
        } else {
            this.selectedProcess = null;
            this.workflowService.callOnSelectCallbacks(null);
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
                    if (this.onChangeCallback) {
                        this.onChangeCallback(processes);
                    }
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

    inDataset() {
        if (!this.selectedProcess) {
            return false;
        }
        return !!(this.selectedProcess.id in this.datasetProcesses);
    }

    removeFromDataset() {
        let p = this.selectedProcess;
        this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
            () => this.experimentProcessesService.removeProcessFromDataset(p, this.dataset, this.datasetProcesses),
            () => this.toast.error(`Unable to remove process from dataset ${p.name}`)
        );
    }

    addToDataset() {
        let p = this.selectedProcess;
        this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
            () => this.experimentProcessesService.addProcessToDataset(p, this.dataset, this.datasetProcesses),
            () => this.toast.error(`Unable to add process to dataset ${p.name}`)
        );
    }
}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog, processesService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.processesService = processesService;
        this.projectId = $stateParams.project_id;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.processesService.deleteProcess(this.projectId, this.process.id).then(
            () => this.$mdDialog.cancel(),
            () => this.$mdDialog.cancel()
        );
    }
}

angular.module('materialscommons').component('mcProcessesWorkflow', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow.html',
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<',
        dataset: '='
    }
});
