class MCProjectFilesViewFileComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            file: null,
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesViewFile', {
    controller: MCProjectFilesViewFileComponentController,
    template: require('./project-files-view-file.html'),
    bindings: {
        file: '<'
    }
});