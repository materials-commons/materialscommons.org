class MCFilesTableComponentController {
    /*@ngInject*/
    constructor(isImage, mcfile, $mdDialog) {
        this.isFileImage = isImage;
        this.mcfile = mcfile;
        this.$mdDialog = $mdDialog;
    }

    fileSrc(fileId) {
        return this.mcfile.src(fileId);
    }

    isImage(mime) {
        return this.isFileImage(mime);
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

angular.module('materialscommons').component('mcFilesTable', {
    templateUrl: 'app/global.components/mc-files-table.html',
    controller: MCFilesTableComponentController,
    bindings: {
        files: '<'
    }
});
