(function (module) {
    module.directive("setupTab", setupTabDirective);

    function setupTabDirective() {
        return {
            scope: {
                setup: '='
            },
            controller: "setupTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true,
            restrict: "E",
            templateUrl: "application/core/projects/project/processes/setup.html"
        };
    }

    module.controller("setupTabDirectiveController", setupTabDirectiveController);
    setupTabDirectiveController.$inject = [];

    function setupTabDirectiveController() {
        var ctrl = this;
        console.log("here is ");
        console.dir(ctrl.setup);
    }
}(angular.module('materialscommons')));
