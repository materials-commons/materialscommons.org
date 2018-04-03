angular.module('materialscommons').component('mcExperimentProcesses', {
    template: require('./mc-experiment-processes.html'),
    controller: MCExperimentProcessesComponentController,
    bindings: {
        processes: '<'
    }
});

/*@ngInject*/
function MCExperimentProcessesComponentController() {
    const ctrl = this;
    ctrl.showTableView = true;
}
