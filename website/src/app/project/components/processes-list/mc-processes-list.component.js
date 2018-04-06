angular.module('materialscommons').component('mcProcessesList', {
    template: require('./mc-processes-list.html'),
    controller: MCProcessesListComponentController,
    bindings: {
        processes: '='
    }
});

/*@ngInject*/
function MCProcessesListComponentController() {
    var ctrl = this;
    ctrl.selectProcess = selectProcess;

    //////////////////////////

    function selectProcess(process) { // eslint-disable-line no-unused-vars
    }
}
