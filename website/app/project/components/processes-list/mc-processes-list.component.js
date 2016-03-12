(function(module) {
    module.component('mcProcessesList', {
        templateUrl: 'app/project/components/processes-list/mc-processes-list.html',
        controller: 'MCProcessesListComponentController',
        bindings: {
            processes: '='
        }
    });

    module.controller('MCProcessesListComponentController', MCProcessesListComponentController);
    MCProcessesListComponentController.$inject = [];
    function MCProcessesListComponentController() {
        var ctrl = this;
        ctrl.selectProcess = selectProcess;

        //////////////////////////

        function selectProcess(process) {
            console.log('selectProcess', process);
        }
    }
}(angular.module('materialscommons')));
