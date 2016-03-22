angular.module('materialscommons').component('mcProcessesList', {
    templateUrl: 'app/project/components/processes-list/mc-processes-list.html',
    controller: MCProcessesListComponentController,
    bindings: {
        processes: '='
    }
});

/*@ngInject*/
function MCProcessesListComponentController() {
    var ctrl = this;
    ctrl.selectProcess = selectProcess;

    //console.log('MCProcessesListComponentController', ctrl.processes.length);

    //////////////////////////

    function selectProcess(process) {
        //console.log('selectProcess', process);
    }
}
