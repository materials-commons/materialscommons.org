angular.module('materialscommons').directive('selectItemsProcesses', selectItemsProcessesDirective);
function selectItemsProcessesDirective() {
    return {
        restrict: 'E',
        scope: {
            processes: '='
        },
        templateUrl: 'app/project/components/select-items/select-items-processes.html'
    }
}
