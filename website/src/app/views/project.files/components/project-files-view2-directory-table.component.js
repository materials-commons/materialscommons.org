class MCProjectFilesView2DirectoryTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            files: [],
            selectionOn: false,
            filterOn: '',
        };
    }

    $onChanges(changes) {
        if (changes.files) {
            this.state.files = angular.copy(changes.files.currentValue);
        }

        if (changes.selectionState) {
            this.state.selectionOn = changes.selectionState.currentValue;
        }

        if (changes.filterOn) {
            this.state.filterOn = changes.filterOn.currentValue;
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesView2DirectoryTable', {
    controller: MCProjectFilesView2DirectoryTableComponentController,
    template: require('./project-files-view2-directory-table.html'),
    bindings: {
        files: '<',
        selectionState: '<',
        filterOn: '<'
    }
});