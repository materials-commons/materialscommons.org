class MCExperimentDatasetComponentController {
    /*@ngInject*/
    constructor(datasetsAPI, experimentsAPI, toast, $stateParams) {
        this.datasetsAPI = datasetsAPI;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.dataset = null;
        this.showDetailsSection = true;
        this.processes = [];
        this.showAll = true;
        this.swap = true;
    }

    $onInit() {
        this.load();
    }

    load() {
        this.datasetsAPI.getDataset(this.projectId, this.experimentId, this.datasetId)
            .then(
                (dataset) => this.dataset = dataset,
                () => this.toast.error('Unable to retrieve datasets for experiment')
            );
        this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId).then(
            (processes) => this.processes = processes,
            () => this.toast.error('Error retrieving processes for experiment')
        );
    }

    showNodes() {
        this.showAll = !this.showAll;
        this.swap = this.showAll;
        if (this.showAll) {
            this.load();
        } else {
            this.processes = this.dataset.processes;
            this.dataset.processes = null;
        }
    }
}

angular.module('materialscommons').component('mcExperimentDataset', {
    template: require('./mc-experiment-dataset.html'),
    controller: MCExperimentDatasetComponentController
});
