class ExperimentProcessesService {
    constructor() {}

    addProcessToDataset(p, dataset, datasetProcesses) {
        if (dataset) {
            p.inds = true;
            p.highlight = true;
            datasetProcesses[p.id] = p;
            dataset.processes.push(p);
        }
    }

    removeProcessFromDataset(p, dataset, datasetProcesses) {
        if (dataset) {
            p.inds = false;
            p.highlight = false;
            delete datasetProcesses[p.id];
            let i = _.findIndex(dataset.processes, (proc) => proc.id === p.id);
            if (i !== -1) {
                dataset.processes.splice(i, 1);
            }
        }
    }
}

angular.module('materialscommons').service('experimentProcessesService', ExperimentProcessesService);
