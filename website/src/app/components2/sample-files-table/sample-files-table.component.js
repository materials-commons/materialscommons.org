class MCSampleFilesTableComponentController {
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

angular.module('materialscommons').component('mcSampleFilesTable', {
    controller: MCSampleFilesTableComponentController,
    template: require('./sample-files-table.html'),
    bindings: {
        files: '<'
    }
});