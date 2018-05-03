class DatasetFilesService {
    /*@ngInject*/
    constructor($mdDialog, selectItems) {
        this.$mdDialog = $mdDialog;
        this.selectItems = selectItems;
    }

    addFiles() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/select-files-dialog.html',
            controller: AddFilesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }

    selectProjectFiles() {
        this.selectItems.fileTree(true).then(
            (selected) => selected.files
        );
    }

    // selectProjectFiles() {
    //     this.selectItems.fileTree(true).then(
    //         (selected) => {
    //             selected.files.forEach(f => {
    //                 if (!f.name) {
    //                     // If f.name doesn't exist then retrieve the file so the name can be shown
    //                     // in the UI list of files.
    //                     this.projectsAPI.getProjectFile(this.projectId, f.id).then(
    //                         (file) => {
    //                             file.selected = true;
    //                             this.files.push(file);
    //                         }
    //                     );
    //                 } else {
    //                     f.selected = true;
    //                     this.files.push(f);
    //                 }
    //             });
    //         }
    //     );
    // }

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