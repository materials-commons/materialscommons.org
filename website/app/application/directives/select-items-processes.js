(function (module) {
    module.directive('selectItemsProcesses', selectItemsProcessesDirective);
    function selectItemsProcessesDirective() {
        return {
            restrict: 'E',
            scope: {
                processes: '='
            },
            templateUrl: 'application/directives/partials/select-items-processes.html'
        }
    }
}(angular.module('materialscommons')));
