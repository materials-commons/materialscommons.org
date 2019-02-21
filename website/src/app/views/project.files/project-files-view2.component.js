class MCProjectFilesView2ComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            activeDir: null,
            selectionState: false,
            filterOn: '',
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
}

angular.module('materialscommons').component('mcProjectFilesView2', {
    controller: MCProjectFilesView2ComponentController,
    template: require('./project-files-view2.html'),
    bindings: {
        activeDir: '<',
        onChangeDir: '&',
        onCreateDir: '&',
    }
});