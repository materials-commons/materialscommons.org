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
    DirControlsDirectiveController.$inject = [];

    function DirControlsDirectiveController() {
        var ctrl = this;
    }
}(angular.module('materialscommons')));
