(function (module) {
    module.directive("processesTab", processesTabDirective);

    function processesTabDirective() {
        return {
            scope: {
                sample: '='
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/samples/processes-tab.html",
            controller: "processesTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true
        };
    }

    module.controller("processesTabDirectiveController", processesTabDirectiveController);
    processesTabDirectiveController.$inject = [];

    function processesTabDirectiveController() {
        var ctrl = this;
    }
}(angular.module('materialscommons')));
