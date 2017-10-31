class MCFileOpsDialogsService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    renameDirectory(dirName) {
        return this.$mdDialog.show({
            templateUrl: 'app/project/files/components/dialogs/rename-dir-dialog.html',
            controller: RenameDirDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                dirName: dirName
            }
        });
    }

    createDirectory(parentDirName) {
        return this.$mdDialog.show({
            templateUrl: 'app/project/files/components/dialogs/create-dir-dialog.html',
            controller: CreateDirDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                parentDirName: parentDirName
            }
        })
    }
}

angular.module('materialscommons').service('mcFileOpsDialogs', MCFileOpsDialogsService);

class RenameDirDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.newDirName = this.dirName;
    }

    done() {
        this.$mdDialog.hide(this.newDirName);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class CreateDirDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.newDirName = "";
    }

    done() {
        this.$mdDialog.hide(this.newDirName);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}