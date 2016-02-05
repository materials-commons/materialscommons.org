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
    DirControlsDirectiveController.$inject = ["Restangular", "$stateParams", "pubsub"];

    function DirControlsDirectiveController(Restangular, $stateParams, pubsub) {
        var ctrl = this;
        ctrl.createDirActive = false;
        ctrl.createDir = createDir;
        ctrl.dirPath = '';

        ///////////////////////

        function createDir() {
            if (ctrl.dirPath !== '') {
                ctrl.createDirActive = false;
                Restangular.one('v2').one('projects', $stateParams.id).one('directories')
                    .customPOST({
                        from_dir: $stateParams.dir_id,
                        path: ctrl.dirPath
                    }).then(function() {
                        pubsub.send('files.dir.refresh', $stateParams.dir_id);
                    }, function() {
                    });
            }
        }
    }
}(angular.module('materialscommons')));
