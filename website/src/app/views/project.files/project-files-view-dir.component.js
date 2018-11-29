class MCProjectFilesViewDirComponentController {
    /*@ngInject*/
    constructor() {
        console.log('mcprojectfilesviewdir');
        this.state = {
            dir: null
        };
    }

    $onChanges(changes) {
        if (changes.dir) {
            this.state.dir = angular.copy(changes.dir.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesViewDir', {
    controller: MCProjectFilesViewDirComponentController,
    template: require('./project-files-view-dir.html'),
    bindings: {
        dir: '<'
    }
});