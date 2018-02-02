class MCDirComponentController {
    /*@ngInject*/
    constructor(mcFileOpsDialogs) {
        this.mcFileOpsDialogs = mcFileOpsDialogs;
        this.selected = false;
        this.selectedFiles = [];
        this.moveFiles = false;
        this.globusUpload = "none";
//        this.globusUpload = "pending";
//        this.globusUpload = "complete";
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

    deleteDir() {
        this.mcFileOpsDialogs.deleteDir(this.dir.data).then(
            () => this.onDelete({items: [this.dir.data]})
        );
    }

    globusUploadPending(){
        let ret = this.globusUpload === "pending";
//        console.log('globusUploadPending',ret);
        return ret;
    }

    globusUploadComplete(){
        let ret = this.globusUpload === "complete";
//        console.log('globusUploadComplete',ret);
        return ret;
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

    handleMove(item) {
        return this.onMove({item: item});
    }

    handleDelete() {
        this.mcFileOpsDialogs.deleteFiles(this.selectedFiles).then(
            () => this.onDelete({items: this.selectedFiles})
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
        onDownloadFiles: '&',
        onDelete: '&',
        onMove: '&'
    }
});