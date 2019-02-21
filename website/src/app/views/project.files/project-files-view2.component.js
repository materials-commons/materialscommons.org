class MCProjectFilesView2ComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            activeDir: null,
            selectionState: false,
            filterOn: '',
            selectedFiles: {},
        };
    }

    $onChanges(changes) {
        if (changes.activeDir) {
            this.state.activeDir = angular.copy(changes.activeDir.currentValue);
        }
    }

    handleChangeDir(path) {
        this.onChangeDir({path: path});
    }

    handleSelectionStateChange(state) {
        this.state.selectionState = state;
    }

    handleFilterOn(filterOn) {
        this.state.filterOn = filterOn;
    }

    handleCreateDir(path) {
        this.onCreateDir({path: path});
    }

    handleAddSelection(file) {
        this.state.selectedFiles[file.id] = file;
    }

    handleRemoveSelection(file) {
        if (file.id in this.state.selectedFiles) {
            delete this.state.selectedFiles[file.id];
        }
    }

    handleDownloadFiles() {
        let files = _.values(this.state.selectedFiles);
        return this.onDownloadFiles({files: files}).then(
            url => {
                this.state.selectedFiles.length = 0;
                this.state.activeDir = angular.copy(this.state.activeDir); // Cause selections to reset
                return url;
            }
        );
    }
}

angular.module('materialscommons').component('mcProjectFilesView2', {
    controller: MCProjectFilesView2ComponentController,
    template: require('./project-files-view2.html'),
    bindings: {
        activeDir: '<',
        onChangeDir: '&',
        onCreateDir: '&',
        onDownloadFiles: '&'
    }
});