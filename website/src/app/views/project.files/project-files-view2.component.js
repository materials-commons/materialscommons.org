class MCProjectFilesView2ComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            activeDir: null,
        };
    }

    $onChanges(changes) {
        if (changes.activeDir) {
            this.state.activeDir = angular.copy(changes.activeDir.currentValue);
        }
    }

    handleOnLoadDir(dir) {
        this.onLoadDir({dir: dir});
    }

    handleOnShowFile(file) {
        this.state.active = file;
    }

    handleDownloadFiles(files) {
        return this.onDownloadFiles({files: files});
    }

    handleUploadFiles() {
        this.state.uploadStarted = true;
    }

    handleFinishUpload(dir, files) {
        this.state.uploadStarted = false;
        this.onFinishFilesUpload({dir: dir, files: files});
    }

    handleCreateDir(parent, createDirName) {
        this.onCreateDir({parent: parent, name: createDirName});
    }

    handleMove(dir, file) {
        return this.onMoveFile({dir: dir, file: file});
    }

    handleDelete(dir, files) {
        this.onDeleteFiles({dir: dir, files: files});
    }

    handleRenameDir(dir, newDirName) {
        this.onRenameDir({dir: dir, name: newDirName});
    }
}

angular.module('materialscommons').component('mcProjectFilesView2', {
    controller: MCProjectFilesView2ComponentController,
    template: require('./project-files-view2.html'),
    bindings: {
        onLoadDir: '&',
        activeDir: '<',
        onDownloadFiles: '&',
        onFinishFilesUpload: '&',
        onCreateDir: '&',
        onMoveFile: '&',
        onDeleteFiles: '&',
        onRenameDir: '&',
    }
});