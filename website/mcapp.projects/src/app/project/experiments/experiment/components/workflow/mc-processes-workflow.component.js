class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor(experimentsService, $stateParams, toast, experimentProcessesService, datasetService,
                workflowService, mcstate, workflowService2) {
        this.experimentsService = experimentsService;
        this.workflowService2 = workflowService2;

        // Initialize callbacks to functions that do nothing. This cleans up the code
        // as we don't have to worry if its been set.
        this.deleteProcessCallback = () => null;
        this.onChangeCallback = () => null;
        this.addProcessCallback = () => null;

        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.selectedProcess = null;
        this.showGraphView = true;
        this.currentTab = 0;
        this.experimentProcessesService = experimentProcessesService;
        this.datasetService = datasetService;
        this.workflowService = workflowService;
        this.mcstate = mcstate;

        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
    }

    $onInit() {
        let onChangeCB = () => this.onChange();
        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
        this.workflowService.setWorkflowChangeCallback(onChangeCB);
    }

    $onDestroy() {
        this.workflowService.clearWorkflowChangeCallbacks();
        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
    }

    setSelectedProcess(processId, hasChildren) {
        if (processId) {
            this.experimentsService.getProcessForExperiment(this.projectId, this.experimentId, processId)
                .then(
                    (process) => {
                        process.hasChildren = hasChildren;
                        this.selectedProcess = process;
                        this.workflowService.callOnSelectCallbacks(process);
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
        this.workflowService2.deleteNodeAndProcess(this.projectId, this.experimentId, this.selectedProcess.id)
    }

    inDataset() {
        if (!this.selectedProcess) {
            return false;
        }
        return (this.selectedProcess.id in this.datasetProcesses);
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

angular.module('materialscommons').component('mcProcessesWorkflow', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow.html',
    controller: MCProcessesWorkflowComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<',
        dataset: '='
    }
});
