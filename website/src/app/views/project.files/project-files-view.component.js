class MCProjectFilesViewComponentController {
    /*@ngInject*/
    constructor($timeout) {
        this.$timeout = $timeout;
        this.state = {
            root: null,
            active: null,
            uploadStarted: false,
            project: null,
            toggle: true,
        }
    }

    $onChanges(changes) {
        if (changes.root) {
            this.state.root = angular.copy(changes.root.currentValue);
            this.state.toggle = false;
            this.$timeout(() => this.state.toggle = true);
        }

        if (changes.activeDir) {
            this.state.active = angular.copy(changes.activeDir.currentValue);
        }

        if (changes.project) {
            this.state.project = changes.project.currentValue;
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

    handleUploadFiles(dir) {
        this.state.uploadStarted = true;
    }

    handleFinishUpload(dir, files) {
        this.state.uploadStarted = false;
        this.onFinishFilesUpload({dir: dir, files: files});
    }

    handleCreateDir(parent, createDirName) {
        this.onCreateDir({parent: parent, name: createDirName});
    }

    handleMove(file) {
        this.onMoveFile({file: file});
    }

    handleDelete(dir, files) {
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
        project: '<',
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