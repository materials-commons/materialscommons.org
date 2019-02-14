class MCProcessFilesTableComponentController {
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

    // showFile(file) {
    //
    // }
}

angular.module('materialscommons').component('mcProcessFilesTable', {
    controller: MCProcessFilesTableComponentController,
    template: require('./process-files-table.html'),
    bindings: {
        files: '<'
    }
});