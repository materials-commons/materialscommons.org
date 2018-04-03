class MCPProjectDatasetDetailsComponentController {
    /*@ngInject*/
    constructor(datasetsAPI, experimentsAPI, toast) {
        this.datasetsAPI = datasetsAPI;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = "24159a31-264b-456c-ab00-eac3dc283b21";
        this.experimentId = "e83207f4-c29f-4672-8035-cdfeae30a7fd";
        this.datasetId = "c20a82d8-23a2-4e9b-ac3e-dc8bf420e301";
        this.showDetailsSection = true;
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
}

angular.module('materialscommons').component('mcPProjectDatasetDetails', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/mc-experiment-dataset.html',
    controller: MCPProjectDatasetDetailsComponentController
});
