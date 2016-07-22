class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, datasetService, mcfile, isImage, showFileService) {
        this.$mdDialog = $mdDialog;
        this.datasetService = datasetService;
        this.mcfile = mcfile;
        this.isImage = isImage;
        this.showFileService = showFileService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
    }

    showFile(file) {
        this.showFileService.showFile(file);
    }

    removeFile(file) {
        this.datasetService.updateFilesInDataset(this.projectId, this.experimentId, this.datasetId, [], [file.id])
            .then(
                (dataset) => this.mcExperimentDataset.dataset = dataset,
                () => this.toast.error('Failed to remove file from dataset')
            );
    }

    fileSrc(fileId) {
        return this.mcfile.src(fileId);
    }
}

angular.module('materialscommons').component('mcDatasetFiles', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-files.html',
    controller: MCDatasetFilesComponentController,
    bindings: {
        files: '<'
    },
    require: {
        mcExperimentDataset: '^mcExperimentDataset'
    }
});
