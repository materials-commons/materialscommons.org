class MCProjectFilesViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            root: null,
            active: null,
        }
    }

    $onChanges(changes) {
        if (changes.root) {
            this.state.root = angular.copy(changes.root.currentValue);
        }

        if (changes.activeDir) {
            this.state.active = angular.copy(changes.activeDir.currentValue);
            console.log('this.state.active', this.state.active);
        }
    }

    gotoTopLevel(dir) {
        this.handleOnLoadDir(dir);
    }

    handleOnLoadDir(dir) {
        this.onLoadDir({dir: dir});
    }

    handleOnShowFile(file) {
        this.state.active = file;
    }

    handleDownloadFiles(files) {
        this.onDownloadFiles({files: files});
    }

    handleUploadFiles() {
        this.onUploadFiles();
    }

    handleCreateDir(parent, createDirName) {
        this.onCreateDir({parent: parent, name: createDirName});
    }

    handleMove(file) {
        this.onMoveFile({file: file});
    }

    handleDelete(dir, files) {
        console.log('projectFilesView handleDelete', dir, files);
        this.onDeleteFiles({dir: dir, files: files});
    }

    handleRenameDir(dir, newDirName) {
        this.onRenameDir({dir: dir, name: newDirName});
    }
}

angular.module('materialscommons').component('mcProjectFilesView', {
    controller: MCProjectFilesViewComponentController,
    template: require('./project-files-view.html'),
    bindings: {
        root: '<',
        onLoadDir: '&',
        activeDir: '<',
        onDownloadFiles: '&',
        onUploadFiles: '&',
        onCreateDir: '&',
        onMoveFile: '&',
        onDeleteFiles: '&',
        onRenameDir: '&',
    }
});