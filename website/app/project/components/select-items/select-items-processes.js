(function (module) {
    module.directive('selectItemsProcesses', selectItemsProcessesDirective);
    function selectItemsProcessesDirective() {
        return {
            restrict: 'E',
            scope: {
                processes: '='
            },
            templateUrl: 'project/components/select-items/select-items-processes.html'
        }
    }
}(angular.module('materialscommons')));
