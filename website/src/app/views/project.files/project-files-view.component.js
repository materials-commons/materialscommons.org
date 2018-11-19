class MCProjectFilesViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            root: null,
        }
    }

    $onChanges(changes) {
        if (changes.root) {
            this.state.root = angular.copy(changes.root.currentValue);
            console.log('root', this.state.root);
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesView', {
    controller: MCProjectFilesViewComponentController,
    template: require('./project-files-view.html'),
    bindings: {
        root: '<'
    }
});