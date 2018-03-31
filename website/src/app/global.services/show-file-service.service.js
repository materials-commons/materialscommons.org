class ShowFileService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    showFile(file, multiple = true) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/show-file-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowFileDialogController,
            bindToController: true,
            multiple: multiple,
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

angular.module('materialscommons').service('showFileService', ShowFileService);
