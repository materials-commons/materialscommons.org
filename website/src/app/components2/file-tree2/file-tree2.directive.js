class MCFileTree2DirectiveController {
    /*@ngInject*/
    constructor() {

    }
}

/*@ngInject*/
function mcFileTreeDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            file: '='
        },
        controller: MCFileTree2DirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        template: require('./file-tree2.html'),
        compile: function (element) {
            return RecursionHelper.compile(element, function () {
            });
        }
    }
}

angular.module('materialscommons').directive('mcFileTree2', mcFileTreeDirDirective);
