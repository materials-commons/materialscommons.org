(function(module) {
    module.component('mcProjectShareTree', {
        templateUrl: 'projects/components/mc-project-share-tree.html',
        controller: 'MCProjectShareTreeComponentController',
        bindings: {
            project: '='
        }
    });
    
    module.controller('MCProjectShareTreeComponentController', MCProjectShareTreeComponentController);
    MCProjectShareTreeComponentController.$inject = ['projectTreeService'];
    function MCProjectShareTreeComponentController() {
        var ctrl = this;
    }

    module.directive('mcProjectTreeShareDir', MCProjectTreeShareDirDirective);
    MCProjectTreeShareDirDirective.$inject = ['RecursionHelper'];
    function MCProjectTreeShareDirDirective(RecursionHelper) {
        return {
            restrict: 'E',
            scope: {
                file: '='
            },
            controller: 'MCProjectTreeShareDirDirectiveController',
            replace: true,
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'projects/components/mc-project-tree-share-dir.html',
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, ielement, iattrs, controller, transcludeFn) {
                });
            }
        }
    }

    module.controller('MCProjectTreeShareDirDirectiveController', MCProjectTreeShareDirDirectiveController);
    MCProjectTreeShareDirDirectiveController.$inject = [];
    function MCProjectTreeShareDirDirectiveController() {

    }
    
}(angular.dmodule('materialscommons')));
