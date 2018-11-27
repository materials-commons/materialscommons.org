class MCProjectFilesViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            root: null,
            all: []
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

class MCFileTreeDirectoryDirectiveController {
    /*ngInject*/
    constructor() {
        console.log('mcFileTreeDirectory', this.file);
        this.state = {
            files: this.file.children
        };
    }
}

/*@ngInject*/
function mcFileTreeDirectoryDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            file: '='
        },
        controller: MCFileTreeDirectoryDirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        template: require('./mc-file-tree-directory.html'),
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    };
}

angular.module('materialscommons').directive('mcFileTreeDirectory', mcFileTreeDirectoryDirective);
