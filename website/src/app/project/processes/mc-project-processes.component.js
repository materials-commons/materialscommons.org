angular.module('materialscommons').component('mcProjectProcesses', {
    templateUrl: 'app/project/processes/mc-project-processes.html',
    controller: MCProjectProcessesComponentController,
    bindings: {
        processes: '<'
    }
});

/*@ngInject*/
function MCProjectProcessesComponentController() {
    var ctrl = this;
    ctrl.showTableView = true;
}