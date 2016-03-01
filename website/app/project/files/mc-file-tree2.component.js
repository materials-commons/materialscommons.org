(function (module) {
    module.component('mcFileTree2', {
        templateUrl: 'project/files/mc-file-tree2.html',
        controller: 'MCFileTree2ComponentController'
    });

    module.controller('MCFileTree2ComponentController', MCFileTree2ComponentController);
    MCFileTree2ComponentController.$inject = [
        '$scope', 'project', '$state', '$stateParams', 'pubsub', 'projectsService', 'gridFiles'
    ];
    function MCFileTree2ComponentController($scope, project, $state, $stateParams, pubsub, projectsService, gridFiles) {
        var ctrl = this;
        var proj = project.get();


        projectsService.getProjectDirectory(proj.id).then(function(files) {
            proj.files = gridFiles.toGrid(files);
            ctrl.files = proj.files;
            ctrl.files[0].data.childrenLoaded = true;
            console.dir(proj.files);
        });
    }

    module.directive('mcFileTree2Dir', mcFileTree2DirDirective);
    mcFileTree2DirDirective.$inject = ['RecursionHelper'];
    function mcFileTree2DirDirective(RecursionHelper) {
        return {
            restrict: 'E',
            scope: {
                file: '='
            },
            controller: 'MCFileTree2DirDirectiveController',
            replace: true,
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'project/files/mc-file-tree2-dir.html',
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, ielement, iattrs, controller, transcludeFn){});
            }
        }
    }

    module.controller('MCFileTree2DirDirectiveController', MCFileTree2DirDirectiveController);
    MCFileTree2DirDirectiveController.$inject = ['projectsService', 'gridFiles', 'project'];
    function MCFileTree2DirDirectiveController(projectsService, gridFiles, project) {
        var ctrl = this;
        var projectID = project.get().id;

        if (ctrl.file.data._type === 'directory' && !ctrl.file.data.childrenLoaded) {
            projectsService.getProjectDirectory(projectID, ctrl.file.data.id).then(function(files) {
                ctrl.file.children = gridFiles.toGridChildren(files);
                ctrl.file.data.childrenLoaded = true;
                ctrl.files = ctrl.file.children;
            });
        } else {
            ctrl.files = ctrl.file.children;
        }
        console.log('MCFileTree2DirectiveController', ctrl.file);
    }
}(angular.module('materialscommons')));