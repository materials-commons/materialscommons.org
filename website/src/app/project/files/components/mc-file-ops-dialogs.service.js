class MCFileOpsDialogsService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    renameDirectory(dirName) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/rename-dir-dialog.html',
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
            templateUrl: 'app/modals/create-dir-dialog.html',
            controller: CreateDirDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                parentDirName: parentDirName
            }
        })
    }

    deleteFiles(files) {
        const confirm = this.$mdDialog.confirm()
            .title('Delete the following files?')
            .textContent(files.map(f => f.name).join(', '))
            .ariaLabel('Please confirm file deletion')
            .ok('Delete')
            .cancel('Cancel');
        return this.$mdDialog.show(confirm);
    }

    deleteDir(dir) {
        const confirm = this.$mdDialog.confirm()
            .title('Delete the following directory?')
            .textContent(dir.name)
            .ariaLabel('Please confirm directory deletion')
            .ok('Delete')
            .cancel('Cancel');
        return this.$mdDialog.show(confirm);
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