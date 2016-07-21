class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, datasetService, mcfile, showFileService) {
        this.$mdDialog = $mdDialog;
        this.datasetService = datasetService;
        this.mcfile = mcfile;
        this.showFileService = showFileService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
    }

    showFile(file) {
        //this.$mdDialog.show({
        //    templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-file-dialog.html',
        //    controllerAs: '$ctrl',
        //    controller: ShowFileDialogController,
        //    bindToController: true,
        //    locals: {
        //        file: file
        //    }
        //});
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

class ShowFileDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
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
