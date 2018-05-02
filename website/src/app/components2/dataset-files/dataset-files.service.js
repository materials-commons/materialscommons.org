class DatasetFilesService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    addFiles() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/create-new-dataset-dialog.html',
            controller: AddFilesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }
}

angular.module('materialscommons').service('datasetFiles', DatasetFilesService);

class AddFilesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}