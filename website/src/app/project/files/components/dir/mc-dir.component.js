class MCDirComponentController {
    /*@ngInject*/
    constructor(mcFileOpsDialogs) {
        this.mcFileOpsDialogs = mcFileOpsDialogs;
        this.selected = false;
        this.selectedFiles = [];
        this.moveFiles = false;
    }

    onSelected(selected) {
        this.selected = selected.length !== 0;
        this.selectedFiles = selected;
    }

    renameDirectory() {
        this.mcFileOpsDialogs.renameDirectory(this.dir.data.name).then(name => this.onRenameDir({newDirName: name}));
    }

    createDirectory() {
        this.mcFileOpsDialogs.createDirectory(this.dir.data.name).then(name => this.onCreateDir({createDirName: name}));
    }

    uploadFiles() {
        this.onUploadFiles();
    }

    handleDownloadFiles() {
        this.downloadState = 'preparing';
        this.onDownloadFiles({files: this.selectedFiles}).then(
            downloadUrl => {
                this.downloadUrl = downloadUrl;
                this.downloadState = 'done';
            }
        );
    }
}

angular.module('materialscommons').component('mcDir', {
    templateUrl: 'app/project/files/components/dir/mc-dir.html',
    controller: MCDirComponentController,
    bindings: {
        dir: '<',
        onRenameDir: '&',
        onCreateDir: '&',
        onUploadFiles: '&',
        onDownloadFiles: '&'
    }
});