angular.module('materialscommons').component('mcProcessesList', {
    templateUrl: 'app/project/components/processes-list/mc-processes-list.html',
    controller: MCProcessesListComponentController,
    bindings: {
        processes: '='
    }
});

function MCProcessesListComponentController() {
    'ngInject';

    var ctrl = this;
    ctrl.selectProcess = selectProcess;

    //////////////////////////

    function selectProcess(process) {
        //console.log('selectProcess', process);
    }
}
