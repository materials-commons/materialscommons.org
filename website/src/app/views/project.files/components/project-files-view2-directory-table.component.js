class MCProjectFilesView2DirectoryTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            files: [],
        };
    }

    $onChanges(changes) {
        if (changes.files) {
            this.state.files = angular.copy(changes.files.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesView2DirectoryTable', {
    controller: MCProjectFilesView2DirectoryTableComponentController,
    template: require('./project-files-view2-directory-table.html'),
    bindings: {
        files: '<',
    }
});