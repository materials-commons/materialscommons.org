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
        }
    }

    handleOnLoadDir(dir) {
        this.onLoadDir({dir: dir});
    }

    handleOnShowFile(file) {
        this.state.active = file;
    }

    handleDownloadFiles(files) {

    }

    handleUploadFiles(files) {

    }

    handleCreateDir(createDirName) {

    }

    handleMove(item) {

    }

    handleDelete(items) {

    }

    handleRenameDir(newDirName) {

    }
}

angular.module('materialscommons').component('mcProjectFilesView', {
    controller: MCProjectFilesViewComponentController,
    template: require('./project-files-view.html'),
    bindings: {
        root: '<',
        onLoadDir: '&',
        activeDir: '<',
    }
});