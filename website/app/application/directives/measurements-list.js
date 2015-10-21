(function(module) {
    module.directive('measurementsList', measurementsListDirective);
    function measurementsListDirective() {
        return {
            restrict: 'E',
            scope: {
                measurements: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/measurements-list.html'
        };
    }
}(angular.module('materialscommons')));

