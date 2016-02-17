(function(module) {
    module.component('mcProcesses', {
        templateUrl: 'components/processes/mc-processes.html',
        controller: 'MCProcessesComponentController',
        bindings: {
            processes: '='
        }
    });

    module.controller('MCProcessesComponentController', MCProcessesComponentController);
    MCProcessesComponentController.$inject = [];
    function MCProcessesComponentController() {
        var ctrl = this;
        ctrl.selectProcess = selectProcess;

        //////////////////////////

        function selectProcess(process) {
            console.log('selectProcess', process);
        }
    }
}(angular.module('materialscommons')));
