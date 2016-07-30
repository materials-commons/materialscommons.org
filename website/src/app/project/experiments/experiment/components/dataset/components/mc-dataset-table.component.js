class MCDatasetTableComponentController {
    /*@ngInject*/
    constructor($stateParams, mcfile, isImage, datasetService, toast) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.datasetService = datasetService;
        this.toast = toast;
    }

    $onInit() {
        this.processesById = {};
        this.dataset.processes.forEach(p => {
            p.processFiles = [];
            this.processesById[p.id] = p;
        });
        this.dataset.files.forEach(f => {
            f.processes.forEach(p => {
                let process = this.processesById[p.process_id];
                f.process_name = process.name;
                process.processFiles.push(f);
            });
        });

        let processes = _.values(this.processesById);
        this.filesWithProcessName = [];
        processes.forEach(p => this.filesWithProcessName = this.filesWithProcessName.concat(p.processFiles));
    }

    removeFile(file) {
        this.datasetService.updateFilesInDataset(this.projectId, this.experimentId, this.datasetId, [], [file.id])
            .then(
                (dataset) => {
                    this.mcExperimentDataset.dataset = dataset;
                    for (; ;) {
                        let index = _.indexOf(this.filesWithProcessName, f => f.id === file.id);
                        if (index === -1) {
                            break;
                        }
                        this.filesWithProcessName.splice(index, 1);
                    }
                },
                () => this.toast.error('Failed to remove file from dataset')
            );
    }
}

angular.module('materialscommons').component('mcDatasetTable', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-table.html',
    controller: MCDatasetTableComponentController,
    bindings: {
        dataset: '<'
    },
    require: {
        mcExperimentDataset: '^mcExperimentDataset'
    }
});
