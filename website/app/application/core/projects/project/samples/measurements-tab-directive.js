(function (module) {
    module.directive("measurementsTab", measurementsTabDirective);

    function measurementsTabDirective() {
        return {
            scope: {
                sample: '='
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/samples/measurements-tab.html",
            controller: "measurementsTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true
        };
    }

    module.controller("measurementsTabDirectiveController", measurementsTabDirectiveController);
    measurementsTabDirectiveController.$inject = [];

    function measurementsTabDirectiveController() {
        var ctrl = this;
    }
}(angular.module('materialscommons')));
