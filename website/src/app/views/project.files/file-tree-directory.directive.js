/*@ngInject*/
function mcFileTreeDirectoryDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            file: '=',
            onLoadDir: '&',
            onShowFile: '&'
        },
        controller: MCFileTreeDirectoryDirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        template: require('./file-tree-directory.html'),
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    };
}

class MCFileTreeDirectoryDirectiveController {
    /*ngInject*/
    constructor() {
        this.state = {
            files: this.file.children
        };
    }

    handleOnLoadDir(dir) {
        this.onLoadDir({dir: dir});
    }

    handleOnShowFile(file) {
        this.onShowFile({file: file});
    }
}

angular.module('materialscommons').directive('mcFileTreeDirectory', mcFileTreeDirectoryDirective);