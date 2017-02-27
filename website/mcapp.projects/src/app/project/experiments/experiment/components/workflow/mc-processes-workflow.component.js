class MCProcessesWorkflowComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams, toast, experimentProcessesService, datasetService,
                workflowService, mcstate, mcbus) {
        this.myName = 'MCProcessesWorkflow';
        this.experimentsAPI = experimentsAPI;
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
        this.mcbus = mcbus;
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
    }

    $onInit() {
        let onChangeCB = () => this.onChange();
        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
        this.mcbus.subscribe('WORKFLOW$CHANGE', this.myName, onChangeCB);

        this.mcbus.subscribe('WORKFLOW$VIEW', this.myName, (whichView) => {
            if (whichView === 'graph') {
                this.showGraphView = true;
            } else {
                this.showGraphView = false;
            }
        });
    }

    $onDestroy() {
        this.mcbus.leave('WORKFLOW$CHANGE', this.myName);
        this.mcbus.leave('WORKFLOW$VIEW', this.myName);
        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
    }

    setSelectedProcess(processId, hasChildren) {
        if (processId) {
            this.experimentsAPI.getProcessForExperiment(this.projectId, this.experimentId, processId)
                .then(
                    (process) => {
                        process.hasChildren = hasChildren;
                        this.selectedProcess = process;
                        this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
                    },
                    () => {
                        this.toast.error('Unable to retrieve process details');
                        this.selectedProcess = null;
                        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
                    }
                );
        } else {
            this.selectedProcess = null;
            this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
        }
    }

    onChange() {
        this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId)
            .then(
                (processes) => this.processes = processes,
                () => this.toast.error('Error retrieving processes for experiment')
            );
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
