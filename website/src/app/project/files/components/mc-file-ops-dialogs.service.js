class MCFileOpsDialogsService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    renameDirectory(dir) {
        return this.$mdDialog.show({
            templateUrl: 'app/project/files/components/dialogs/rename-dir-dialog.html',
            controller: RenameDirDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                dir: dir
            }
        });
    }
}

angular.module('materialscommons').service('mcFileOpsDialogs', MCFileOpsDialogsService);

class RenameDirDialogController {
    /*@ngInject*/
    constructor($mdDialog, mcprojstore, gridFiles) {
        this.$mdDialog = $mdDialog;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.newDirName = this.dir.data.name;
    }

    done() {
        this.$mdDialog.hide(this.newDirName);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}