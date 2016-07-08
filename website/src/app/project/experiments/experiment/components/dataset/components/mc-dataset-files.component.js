class MCDatasetFilesComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    showFile(file) {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-file-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowFileDialogController,
            bindToController: true,
            locals: {
                file: file
            }
        });
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
    }
});
