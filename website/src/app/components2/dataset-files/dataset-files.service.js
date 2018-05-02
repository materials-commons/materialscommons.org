class DatasetFilesService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    addFiles() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/select-files-dialog.html',
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
        let files = [
            {
                selected: false,
                id: 11,
                name: 'new -- hardeningdata.xls',
                path: 'project1/hardening tests',
                samples: 'E1XKG'
            },
            {
                selected: false,
                id: 12,
                name: 'new -- crack.tiff',
                path: 'project1/hardening tests',
                samples: 'S1XKG'
            },
        ];
        this.$mdDialog.hide(files);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}