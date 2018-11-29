class MCProjectFilesViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            root: null,
            all: [],
            active: 'active',
        }
    }

    $onChanges(changes) {
        if (changes.root) {
            this.state.root = angular.copy(changes.root.currentValue);
            console.log('root', this.state.root);
        }
    }

    handleOnLoadDir(dir) {
        console.log('MCProjectsFilesViewComponentController handleOnLoadDir');
        this.onLoadDir({dir: dir});
        this.state.active = dir;
    }

    handleOnShowFile(file) {
        console.log('MCProjectFilesView handleOnShowFile', file);
        this.state.active = file;
    }
}

angular.module('materialscommons').component('mcProjectFilesView', {
    controller: MCProjectFilesViewComponentController,
    template: require('./project-files-view.html'),
    bindings: {
        root: '<',
        onLoadDir: '&',
    }
});