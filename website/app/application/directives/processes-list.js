(function(module) {
    module.directive('processesList', processesListDirective);
    function processesListDirective() {
        return {
            restrict: 'E',
            scope: {
                processes: '='
            },
            templateUrl: 'application/directives/partials/processes-list.html'
        };
    }
}(angular.module('materialscommons')));

