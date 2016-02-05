(function (module) {
    module.directive('dirControls', dirControlsDirective);
    function dirControlsDirective() {
        return {
            restrict: "E",
            scope: {
                dir: "="
            },
            controller: 'DirControlsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/dir-controls.html'
        };
    }

    module.controller('DirControlsDirectiveController', DirControlsDirectiveController);
    DirControlsDirectiveController.$inject = ["projectsService", "$stateParams", "pubsub"];

    function DirControlsDirectiveController(projectsService, $stateParams, pubsub) {
        var ctrl = this;
        ctrl.createDirActive = false;
        ctrl.createDir = createDir;
        ctrl.dirPath = '';

        ///////////////////////

        function createDir() {
            if (ctrl.dirPath !== '') {
                ctrl.createDirActive = false;
                projectsService.createProjectDir($stateParams.id, $stateParams.dir_id, ctrl.dirPath)
                    .then(function () {
                        pubsub.send('files.dir.refresh', $stateParams.dir_id);
                    });
            }
        }
    }
}(angular.module('materialscommons')));
