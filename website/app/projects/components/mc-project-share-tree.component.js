(function(module) {
    var placeholderName = '__$$placeholder$$__';

    function loadEmptyPlaceHolder(dir) {
        dir.children.push({
            data: {
                name: placeholderName,
                _type: 'file'
            }
        });
    }

    module.component('mcProjectShareTree', {
        templateUrl: 'projects/components/mc-project-share-tree.html',
        controller: 'MCProjectShareTreeComponentController',
        bindings: {
            project: '='
        }
    });
    
    module.controller('MCProjectShareTreeComponentController', MCProjectShareTreeComponentController);
    MCProjectShareTreeComponentController.$inject = ['projectTreeService'];
    function MCProjectShareTreeComponentController(projectTreeService) {
        var ctrl = this;

        ctrl.project.components = projectTreeService.createProjectRoot(ctrl.project);
        ctrl.components = ctrl.project.components;
        ctrl.components[0].data.childrenLoaded = true;
        ctrl.components[0].expand = true;
    }

    module.directive('mcProjectShareTreeDir', MCProjectShareTreeDirDirective);
    MCProjectShareTreeDirDirective.$inject = ['RecursionHelper'];
    function MCProjectShareTreeDirDirective(RecursionHelper) {
        return {
            restrict: 'E',
            scope: {
                component: '=',
                project: '='
            },
            controller: 'MCProjectShareTreeDirDirectiveController',
            replace: true,
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'projects/components/mc-project-share-tree-dir.html',
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, ielement, iattrs, controller, transcludeFn) {
                });
            }
        }
    }

    module.controller('MCProjectShareTreeDirDirectiveController', MCProjectShareTreeDirDirectiveController);
    MCProjectShareTreeDirDirectiveController.$inject = [];
    function MCProjectShareTreeDirDirectiveController() {
        var ctrl = this;
        ctrl.components = ctrl.component.children;
        ctrl.setActive = setActive;

        ////////////////////

        function setActive(node, component) {
            clearActiveStateInAllNodes();
            console.dir(component);
            console.dir(ctrl.project);
        }

        function clearActiveStateInAllNodes() {
            var treeModel = new TreeModel(),
                root = treeModel.parse(ctrl.project.components[0]);
            root.walk(function(treeNode) {
                treeNode.model.active = false;
            });
        }
    }
    
}(angular.module('materialscommons')));
