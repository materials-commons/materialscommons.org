class WorkflowStateService {
    /*@ngInject*/
    constructor(mcstate, experimentsAPI, publicDatasetsAPI, toast, mcprojstore) {
        this.mcstate = mcstate;
        this.experimentsAPI = experimentsAPI;
        this.publicDatasetsAPI = publicDatasetsAPI;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
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
            this.mcprojstore.currentProcess = process;
            this.mcprojstore.updateCurrentProcess((currentProcess) => {
                currentProcess.hasChildren = hasChildren;
                return currentProcess;
            });
            // this.experimentsAPI.getProcessForExperiment(projectId, experimentId, process.id)
            //     .then(
            //         (process) => {
            //             process.hasChildren = hasChildren;
            //             this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
            //         },
            //         () => {
            //             this.toast.error('Unable to retrieve process details');
            //             this.selectedProcess = null;
            //             this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
            //         }
            //     );
        } else {
            this.selectedProcess = null;
            this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
        }
    }

    updateSelectedProcessForDataset(process, hasChildren) {
        if (process) {
            process.hasChildren = hasChildren;
            this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
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
