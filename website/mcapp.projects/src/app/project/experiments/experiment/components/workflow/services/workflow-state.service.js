class WorkflowStateService {
    /*@ngInject*/
    constructor(mcstate, experimentsAPI, publidDatasetsAPI, toast) {
        this.mcstate = mcstate;
        this.experimentsAPI = experimentsAPI;
        this.publicDatasetsAPI = publidDatasetsAPI;
        this.toast = toast;

        this.processes = [];
        this.dataset = null;
        this.datasetProcesses = {};
    }

    setDataset(dataset) {
        this.dataset = dataset;
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
    }

    setSelectedProcess(process) {
        this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
    }

    getSelectedProcess() {
        return this.mcstate.get(this.mcstate.SELECTED$PROCESS);
    }

    updateSelectedProcessForExperiment(projectId, experimentId, process, hasChildren) {
        if (process) {
            this.experimentsAPI.getProcessForExperiment(projectId, experimentId, process.id)
                .then(
                    (process) => {
                        process.hasChildren = hasChildren;
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

    updateSelectedProcessForDataset(datasetId, process, hasChildren) {
        if (process) {
            this.publicDatasetsAPI.getDatasetProcess(datasetId, process.id)
                .then(
                    (process) => {
                        process.hasChildren = hasChildren;
                        this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
                    },
                    () => {
                        this.toast.error('Unable to retrieve process details');
                        this.selectedProcess = null;
                        this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
                    }
                )
        } else {
            this.selectedProcess = null;
            this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
        }
    }

    subscribeSelectedProcess(name, cb) {
        this.mcstate.subscribe(this.mcstate.SELECTED$PROCESS, name, cb);
    }

    leaveSelectedProcess(name) {
        this.mcstate.leave(this.mcstate.SELECTED$PROCESS, name);
    }
}

angular.module('materialscommons').service('workflowState', WorkflowStateService);
