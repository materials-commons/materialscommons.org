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
        ctrl.nodropEnabled = false;

        ctrl.treeOptions = {
            dragStart: function(event) {
                ctrl.nodropEnabled = true;
                return true;
            },

            beforeDrop: function(event) {
                ctrl.nodropEnabled = false;
                return true;
            }
        };
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
    MCProjectShareTreeDirDirectiveController.$inject = ['gridFiles'];
    function MCProjectShareTreeDirDirectiveController(gridFiles) {
        var ctrl = this;
        ctrl.components = ctrl.component.children;
        ctrl.setActive = setActive;
        ctrl.placeholderName = placeholderName;

        ////////////////////

        function setActive(node, component) {
            clearActiveStateInAllNodes();
            if (!component.data.childrenLoaded && component.data.id.startsWith('processes__')) {
                component.children = gridFiles.toGridChildren({children: ctrl.project.processes});
                component.data.childrenLoaded = true;
                if (!component.children.length) {
                    loadEmptyPlaceHolder(component);
                }
            } else if (!component.data.childrenLoaded && component.data.id.startsWith('samples__')) {
                component.children = gridFiles.toGridChildren({children: ctrl.project.samples});
                component.data.childrenLoaded = true;
                if (!component.children.length) {
                    //loadEmptyPlaceHolder(component);
                }
            }

            component.expand = !component.expand;
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
