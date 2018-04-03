angular.module('materialscommons').directive('selectItemsProcesses', selectItemsProcessesDirective);
function selectItemsProcessesDirective() {
    return {
        restrict: 'E',
        scope: {
            processes: '='
        },
        template: require('./select-items-processes.html')
    }
}

